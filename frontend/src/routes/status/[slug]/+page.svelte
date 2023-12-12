<script lang="ts">
    import QRCode from 'qrcode'
    import { onMount } from 'svelte';
    import {env} from '$env/dynamic/public'
    import {goto} from '$app/navigation'
    import {t} from '$lib/translations'
    import {QUEUE_STATUS} from '$lib/enum'
    import { Button, Modal, Heading } from 'flowbite-svelte'
    import {getWSUrl} from '$lib/utils'

    import type {StatusInfo} from '$lib/types.js'

    export let data

    const ApiURL:string = data.ApiURL
    const queueStatus:StatusInfo = data.details
    const WS_SERVER = env.PUBLIC_WS_URL
    const WS_PORT = env.PUBLIC_WS_PORT

    let qrcodeurl:string = ""
    let queueCount:number = -1
    let estimateTime:number = -1
    let checkgreen:boolean = false
    let checkyellow:boolean = false
    let checkred:boolean = (queueStatus.status == QUEUE_STATUS.CANCELLED)
    let cancelConfirmation:boolean = false
    let terminateSocket:boolean = false
    let cancelMsg:string = ""

    let statusSocket:WebSocket
    
    const connectServer = () => {
        if (queueStatus.status == QUEUE_STATUS.CANCELLED) {
            return
        }
        statusSocket = new WebSocket(getWSUrl(WS_SERVER,WS_PORT))
        statusSocket.addEventListener("open", ()=> {
            console.log("Connected to Status Server")
        })
        statusSocket.addEventListener("message", (msg)=> {
            if (msg.data === 'ack') {
                statusSocket.send(JSON.stringify({type:"status",key:data.key}))
                return
            }
            let msgToken = JSON.parse(msg.data)
            if (msgToken.type === 'update') {
                queueCount = msgToken.count
                if (msgToken.time > 0 ) {
                    estimateTime = Math.ceil(msgToken.time/60)
                } else {
                    estimateTime = -1
                }
                queueCheck();
            }
            
        })
        statusSocket.addEventListener("close", (ev) => {
            console.log("Status server disconnected")
            if (!terminateSocket) {
                setTimeout(function() {
                    connectServer();
                }, 30000);
            }

        })
    }

    const queueCheck = () => {
        //when it is your turn
        checkgreen = false
        checkyellow = false
        if (queueCount <= 0) {
            statusSocket.close()
            checkyellow = true
        } else if (queueCount <=2) {
            checkgreen = true
        }
    }

    onMount(() => {
        QRCode.toDataURL(window.location.origin+'/'+data.link)
        .then(url => {
            qrcodeurl = url
        })
        .catch(err => {
            console.error(err)
        })
        if (queueStatus.status != QUEUE_STATUS.CANCELLED) {
            connectServer()
        }        
    })
    const confirmCancel = ()=>{
        let bodyVar = {"status":QUEUE_STATUS.CANCELLED}
		fetch(ApiURL+'status/delete/'+data.key, {
            method:'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyVar),
        }).then(response => response.json())
        .then(data => {
            window.location.reload()
        })
    }
    const confirmAlert = () => {
        confirmCancel()
        cancelConfirmation = false
        cancelMsg = ""
    }
    const removeAlert = () => {
        cancelConfirmation = false
        cancelMsg = ""
    }
    const showAlert = () => {
        cancelConfirmation = true
        cancelMsg = $t('status.status_queue_number_cancel_qn')
    }
    const back = () => {
        terminateSocket = true
        if (statusSocket) {
            statusSocket.close()
        }
        
        goto("/new/"+data.branchKey,{replaceState:true})
    }

    let cardClass = 'w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 text-center p-6 rounded-xl m-auto mt-8 mb-5 '
    $: {
        let bgColor = 'bg-teal-200'
        if (checkgreen) {
            bgColor = 'bg-green-400 '
        }
        if (checkyellow) {
            bgColor = 'bg-yellow-300 '
        }
        if (checkred) {
            bgColor = 'bg-red-600 '
        }
        cardClass = 'w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 text-center p-6 rounded-xl m-auto mt-8 mb-5 ' + bgColor
    }
</script>

<Modal bind:open={cancelConfirmation} size="xs" autoclose>
    <div class="text-center">
        <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{cancelMsg}</h3>
        <Button color="red" class="mr-2" on:click={confirmAlert}>{$t('common.btn_yes')}</Button>
        <Button color='alternative' on:click={removeAlert}>{$t('common.btn_no')}</Button>
    </div>
</Modal>
<div class={cardClass}>
    
    {$t('status.status_queue_number')}
    <Heading>{queueStatus.queue}</Heading>
    {#if queueStatus.status == QUEUE_STATUS.CANCELLED}
        <div class="my-3">{$t('status.status_queue_number_deleted')}</div>
    {:else}
        {#if queueCount>1}
            <div class="my-3">
                {$t('status.status_queue_queue_count', { count: (queueCount-1) })}
            {#if estimateTime>0}
                <br />
                {$t('status.status_queue_queue_time', { count: (estimateTime) })}
            {/if}
            </div>
        {/if}
        {#if queueCount==1}
            <div class="my-3">
                {$t('status.status_queue_number_next')}
            </div>
        {/if}
        {#if queueCount==0}
            <div class="my-3">
                {$t('status.status_queue_number_call')}
            </div>
        {/if}
    {/if}
</div>
{#if data.reset}
<div class="m-auto text-center"><Button color="green" on:click={back}>{$t('common.btn_back')}</Button></div>
{:else}
    {#if queueCount>=0}
    <div class="text-center"><Button color="red" on:click={showAlert}>{$t('status.status_queue_number_cancel')}</Button></div>
    {/if}
{/if}

<div class="text-center mt-5">
    {$t('status.status_qr_code_scan')}
    <br />
    <img class=" m-auto" alt="URL to access the status" src={qrcodeurl} />
</div>
