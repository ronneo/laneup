<script lang="ts">
    import { onMount } from 'svelte';
    import {env} from '$env/dynamic/public'
    import {QUEUE_STATUS} from '$lib/enum'
    import {t} from '$lib/translations'; 
    import { Button, Modal, ButtonGroup, Heading } from 'flowbite-svelte'
    import {getWSUrl} from '$lib/utils'

    import type {BranchGroups, BranchGroupsAllInfo} from '$lib/types'
    
    export let data

    const ApiURL:string = data.apiURL
    const WS_SERVER = env.PUBLIC_WS_URL
    const WS_PORT = env.PUBLIC_WS_PORT

    let groups:Array<BranchGroups> = data.groups
    let AllInfoGroups:Array<BranchGroupsAllInfo> = []
    let cancelConfirmation:boolean = false
    let cancelMsg:string = ""
    let alertfunc:Function
    let statusSocket:WebSocket
    let paused:boolean = false

    groups.forEach((group, index) => {
        AllInfoGroups[index] = {
            groupID: group.groupID,
            groupName: group.groupName,
            count:0,
            nextQueue:0,
            nextQueueID:0,
            queue:[]
        }
    })

    const connectServer = () => {
        console.log(getWSUrl(WS_SERVER,WS_PORT))
        statusSocket = new WebSocket(getWSUrl(WS_SERVER,WS_PORT))
        statusSocket.addEventListener("open", ()=> {
            console.log("Connected to Status Server")
        })
        statusSocket.addEventListener("message", (msg)=> {
            console.log("Received message")
            if (msg.data === 'ack') {
                statusSocket.send(JSON.stringify({type:"panel",branchID:data.branchID}))
                return
            }
            let msgToken = JSON.parse(msg.data)
            let updateGroups = msgToken.groups
            if (msgToken.type === 'update') {
                let tmpGroups:Array<BranchGroupsAllInfo> = []
                groups.forEach((group, index) => {
                    if (updateGroups[group.groupID]) {
                        tmpGroups[index] = {
                            groupID: group.groupID,
                            groupName: group.groupName,
                            count: updateGroups[group.groupID].count,
                            nextQueue: updateGroups[group.groupID].nextQueue,
                            nextQueueID: updateGroups[group.groupID].nextQueueID,
                            queue: updateGroups[group.groupID].queue
                        }
                    }
                })
                AllInfoGroups = tmpGroups
            }
        })
        statusSocket.addEventListener("close", (ev) => {
            console.log("Status server disconnected")
            setTimeout(function() {
                connectServer();
            }, 5000);
        })        
    }
    onMount(() => {
        connectServer()
    })

    const callNextNumber = (groupID:number) => {
        let nextNumber:number = 0
        AllInfoGroups.forEach(group => {
            if (group.groupID == groupID) {
                if (group.queue != null) {
                    nextNumber = group.queue[0].id
                } 
            }
        })
        let bodyVar = {"status":QUEUE_STATUS.COMPLETED}
		fetch(ApiURL+'user/'+nextNumber, {
            method:'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyVar),
        }).then(response => response.json())
        .then(data => {
        })
    }


    const confirmCancel = (gid:number) => {
        let bodyVar = {"status":QUEUE_STATUS.CANCELLED}
		fetch(ApiURL+'user/'+gid, {
            method:'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyVar),
        }).then(response => response.json())
        .then(data => {
        })
    }
    const confirmAlert = () => {
        alertfunc();
        cancelConfirmation = false
        cancelMsg = ""
    }
    const removeAlert = () => {
        cancelConfirmation = false
        cancelMsg = ""
    }
    const setCurrentSkip = (gid:number) => {
        let bodyVar = {"status":QUEUE_STATUS.DELAYED}
		fetch(ApiURL+'user/'+gid, {
            method:'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyVar),
        }).then(response => response.json())
        .then(data => {
        })
    }
    const setCurrentCancel = (queueno:number, gid:number) => {
        cancelMsg = "Are you sure you want to delete "+queueno
        alertfunc = () => {
            confirmCancel(gid)
        }
        cancelConfirmation = true
    }
    const setLoading = () => {
        paused = true
        setTimeout(() => {
            paused = false
        }, 5000)
    }
    const isLoading = ():boolean => {
        return paused
    }

    const setComplete = (gid:number) => {
        if (isLoading()) {
            return
        }
        setLoading()
        
        let bodyVar = {"status":QUEUE_STATUS.COMPLETED}
		fetch(ApiURL+'user/'+gid, {
            method:'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyVar),
        }).then(response => response.json())
        .then(data => {
        })
    }
    const setCancel = (queueno:string, gid:number) => {
        cancelMsg = "Are you sure to delete "+queueno
        alertfunc = () => {
            confirmCancel(gid)
        }
        cancelConfirmation = true
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

<div class="flex flex-col lg:flex-row w-full h-screen justify-between [&>*:nth-child(even)]:bg-zinc-100">
    {#each AllInfoGroups as group}
    <div class="h-screen flex-1 text-center">
        <Heading tag="h5" class="mb-3">{group.groupName}</Heading>
        {#if group.count > 0}
        <Button size="md" color="green" on:click={() => { callNextNumber(group.groupID) }}>{$t('manager.btn_call_next')}</Button>
        {/if}
        <div class="mt-3">
            {#if group.nextQueue != 0}
            <div class="mb-3 border-b border-slate-300 pt-3 pb-5">
                <div class="mb-3">Current <Heading>{group.nextQueue}</Heading></div>
                <ButtonGroup>
                    <Button color="alternative" on:click={() => {setCurrentSkip(group.nextQueueID)}}>{$t('common.btn_skip')}</Button>
                    <Button color="red" on:click={() => {setCurrentCancel(group.nextQueue, group.nextQueueID)}}>{$t('common.btn_delete')}</Button>
                </ButtonGroup>            
            </div>
            {:else}
            <div class="current"></div>
            {/if}
            
           
            {#if group.queue != undefined}
            <div class="grid grid-cols-3 gap-3">
                {#each group.queue as queueNum}
                    <div class="pt-2">{queueNum.queue}</div>
                    <div><Button color="green" on:click={() => {setComplete(queueNum.id)}}>{$t('common.btn_call')}</Button></div>
                    <div><Button color="red" on:click={() => {setCancel(queueNum.queue, queueNum.id)}}>{$t('common.btn_delete')}</Button></div>
                {/each}
            </div>
            {/if}
            
        </div>
    </div>
    {/each}
</div>