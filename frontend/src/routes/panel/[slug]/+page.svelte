<script lang="ts">
    import { onMount } from 'svelte';
    import {env} from '$env/dynamic/public'
    import {Heading, Hr, Card} from 'flowbite-svelte'
    import {getWSUrl} from '$lib/utils'

    import type {BranchGroups, BranchGroupsAllInfo} from '$lib/types'

    export let data;

    const WS_SERVER = env.PUBLIC_WS_URL
    const WS_PORT = env.PUBLIC_WS_PORT

    let groups:Array<BranchGroups> = data.groups
    let AllInfoGroups:Array<BranchGroupsAllInfo> = []
    let statusSocket:WebSocket

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

</script>
<div class="flex flex-col lg:flex-row w-full h-screen justify-between [&>*:nth-child(even)]:bg-zinc-100">
    {#each AllInfoGroups as group}
    <div class="p-3 h-screen flex-1">
        <Heading tag="h4">{group.groupName}</Heading>
        <Hr class="my-2 w-full" height="h-px" />
        <div>
            {#if group.nextQueue != 0 && group.nextQueue != undefined}
            <Card>Serving <Heading>{group.nextQueue}</Heading></Card>
            {:else}
            <div></div>
            {/if}
            
           
            {#if group.queue != undefined}

            <div class="grid grid-cols-2 gap-2 mt-4">
                {#each group.queue as queueNum}
                    <div>{queueNum['queue']}</div>
                {/each}
            </div>
            {/if}
            
        </div>
    </div>
    {/each}
</div>