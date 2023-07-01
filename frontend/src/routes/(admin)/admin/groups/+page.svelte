<script lang="ts">
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Button, Modal, Label, Input, Alert, Select, Heading } from 'flowbite-svelte';
    import { applyAction, deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
    import { invalidateAll, goto } from '$app/navigation';
    export let data
    export let form

    let branches = data.branches
    let groups = data.groups
    let addModal:HTMLFormElement
    let showModal:boolean = (form?.invalidentry)?true:false
    let modalName:string = 'Add new Group'
    let groupName:string = ''
    let queueSeed:string = ''
    let queuePrefix:string = ''
    let branchID:string = ''
    let showAlert:boolean = false
    let deleteGroupName:string = ''
    let deleteGroup:Function
    let updateGroupID:string = ''
    let formAction = '?/addgroup'

    $: queueno = isNaN(parseInt(queueSeed))?1:(parseInt(queueSeed) + 1)

    const showGroupDetails = () => {
        modalName = 'Add new Group'
        groupName = ''
        branchID = groups[0].branchID
        queueSeed = ''
        queuePrefix = ''
        showModal = true
        updateGroupID = ''
        formAction = '?/addgroup'
    }

    const handleSubmit = async () => {
        const fdata = new FormData(addModal);
        fdata.set('branchID', branchID)
        const response = await fetch(formAction, {
            method: 'POST',
            body: fdata
        });
        const result:ActionResult = deserialize(await response.text());

        if (result.type === 'success') {
            // re-run all `load` functions, following the successful update
            await invalidateAll();
            groups = data.groups
        } else {
            showModal = true
        }

        applyAction(result);
    }

    const deleteGroupConfirmation = async (id:string, name:string) => {
        showAlert = true
        deleteGroupName = name
        deleteGroup = async () => {
            const fdata = new FormData()
            fdata.append('groupID', id)
            const response = await fetch('?/deletegroup', {
                method: 'POST',
                body: fdata
            });
            const result:ActionResult = deserialize(await response.text());

            if (result.type === 'success') {
                await invalidateAll();
                groups = data.groups
            }
            applyAction(result);
        }
    }
    const updateGroup = (details:any) => {
        modalName = 'Edit Group'
        branchID = details.branchID
        groupName = details.groupName
        queueSeed = details.queueSeed
        queuePrefix = details.queuePrefix
        showModal = true
        formAction = '?/updategroup'
        updateGroupID = details.groupID 
    }
</script>
<div>
    <Modal bind:open={showAlert} size="xs" autoclose>
        <div class="text-center">
            <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete {deleteGroupName}? All associated data (users) will also be deleted</h3>
            <Button color='alternative'>No, cancel</Button>
            <Button color="red" class="mr-2" on:click={() => deleteGroup()}>Yes, I'm sure</Button>
            
        </div>
    </Modal>
    <Modal title={modalName} bind:open={showModal} autoclose  class="w-full">
        <div>
            <div class="text-sm">Queue no example</div>
            <Heading tag="h3" class="pt-0 m-0">{queuePrefix}<secondary>{queueno}</secondary></Heading>
        </div>
        {#if form?.invalidentry}
        <Alert dismissable={true} accent={true} color="red" class="mb-4">
            <span class="font-medium">Invalid Group name or Queue Starting Number
        </Alert>
        {/if}
        <form bind:this={addModal} class="space-y-6" action="?/addbranch" on:submit|preventDefault={handleSubmit} method="POST">
            <input type="hidden" name="groupID" value={updateGroupID} />
            <Label class="space-y-2">
                <span>Name</span>
                <Input type="text" name="groupName" placeholder="Name of this group" maxlength="200"  value={form?.groupName ?? groupName} required  />
            </Label>
            <Label class="space-y-2">
                <span>Queue Prefix</span> 
                <Input type="text" name="queuePrefix" placeholder="Character prefix for Queue number" maxlength="5"  bind:value={queuePrefix} />
            </Label>
            <Label class="space-y-2">
                <span>Queue Starting Number</span> 
                <Input type="number" name="queueSeed" placeholder="Queue will start from this number" bind:value={queueSeed}  />
            </Label>
            <Label class="space-y-2">
                <span>Branch</span>
                <Select name="brandID" bind:value="{branchID}">
                    {#each branches as branch}
                        <option value={branch.branchID}>{branch.branchName}</option>
                    {/each}
                </Select>
            </Label>
        </form>
        <svelte:fragment slot='footer'>
            <Button color="alternative">Cancel</Button>
            <Button color="green" on:click={() => handleSubmit() }>Save</Button>
        </svelte:fragment>
    </Modal>
    {#if form?.deletesuccess}
    <Alert dismissable={true} accent={true} color="green" class="mb-4">
        <span class="font-medium">Group Removed.
    </Alert>
    {/if}
    {#if form?.success}
    <Alert dismissable={true} accent={true} color="green" class="mb-4">
        <span class="font-medium">Group Added.
    </Alert>
    {/if}
    {#if form?.updatesuccess}
    <Alert dismissable={true} accent={true} color="green" class="mb-4">
        <span class="font-medium">Branch Updated.
    </Alert>
    {/if}
    <Button color="blue" on:click={() => {showGroupDetails()}}>Add new Group</Button>
    <Table striped={true} class="mt-6">
        <TableHead>
            <TableHeadCell>No.</TableHeadCell>
            <TableHeadCell>Group Name</TableHeadCell>
            <TableHeadCell>Branch Name</TableHeadCell>
            <TableHeadCell>Group Seed</TableHeadCell>
            <TableHeadCell>Group Prefix</TableHeadCell>
            <TableHeadCell>
                <span class="sr-only"> Edit </span>
            </TableHeadCell>
            <TableHeadCell>
                <span class="sr-only"> Delete </span>
            </TableHeadCell>
        </TableHead>
        <TableBody>
        {#each groups as group, index}
            <TableBodyRow>
                <TableBodyCell>{index+1}</TableBodyCell>
                <TableBodyCell>{group.groupName}<br /><span class="text-gray-500 text-xs">ID: {group.groupID}</span></TableBodyCell>
                <TableBodyCell>{group.branchName}</TableBodyCell>
                <TableBodyCell>{group.queueSeed}</TableBodyCell>
                <TableBodyCell>{group.queuePrefix}</TableBodyCell>
                <TableBodyCell>
                    <Button color="alternative" on:click={() => updateGroup(group)}>Edit</Button>
                </TableBodyCell>
                <TableBodyCell>
                    <Button color="alternative" on:click={() => deleteGroupConfirmation(group.groupID, group.groupName)}>Delete</Button>
                </TableBodyCell>
            </TableBodyRow>
        {/each}
        </TableBody>
    </Table>
</div>