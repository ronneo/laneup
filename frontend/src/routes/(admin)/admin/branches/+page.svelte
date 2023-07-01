<script lang="ts">
    import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Button, Modal, Label, Input, Alert } from 'flowbite-svelte';
    import { applyAction, deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
    import { invalidateAll, goto } from '$app/navigation';
    export let data
    export let form

    let branches = data.branches
    let addModal:HTMLFormElement
    let showModal:boolean = (form?.invalidentry)?true:false
    let modalName:string = 'Add new Branch'
    let branchName:string = ''
    let branchKey:string = ''
    let showAlert:boolean = false
    let deleteBranchName:string = ''
    let deleteBranch:Function
    let updateBranchID:string = ''
    let formAction = '?/addbranch'

    const showBranchDetails = () => {
        modalName = 'Add new Branch'
        branchName = ''
        branchKey = ''
        showModal = true
        updateBranchID = ''
        formAction = '?/addbranch'
    }

    const handleSubmit = async () => {
        const fdata = new FormData(addModal);
        const response = await fetch(formAction, {
            method: 'POST',
            body: fdata
        });
        const result:ActionResult = deserialize(await response.text());

        if (result.type === 'success') {
            // re-run all `load` functions, following the successful update
            await invalidateAll();
            branches = data.branches
        } else {
            showModal = true
        }

        applyAction(result);
    }

    const deleteBranchConfirmation = async (id:string, name:string) => {
        showAlert = true
        deleteBranchName = name
        deleteBranch = async () => {
            const fdata = new FormData()
            fdata.append('branchID', id)
            const response = await fetch('?/deletebranch', {
                method: 'POST',
                body: fdata
            });
            const result:ActionResult = deserialize(await response.text());

            if (result.type === 'success') {
                await invalidateAll();
                branches = data.branches
            }
            applyAction(result);
        }
    }
    const updateBranch = (id:string, name:string, key:string) => {
        modalName = 'Edit Branch'
        branchName = name
        branchKey = key
        showModal = true
        formAction = '?/updatebranch'
        updateBranchID = id
    }
</script>
<div>
    <Modal bind:open={showAlert} size="xs" autoclose>
        <div class="text-center">
            <svg aria-hidden="true" class="mx-auto mb-4 w-14 h-14 text-gray-400 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete {deleteBranchName}? All associated data (groups, users) will also be deleted</h3>
            <Button color='alternative'>No, cancel</Button>
            <Button color="red" class="mr-2" on:click={() => deleteBranch()}>Yes, I'm sure</Button>
            
        </div>
    </Modal>
    <Modal title={modalName} bind:open={showModal} autoclose  class="w-full">
        {#if form?.invalidentry}
        <Alert dismissable={true} accent={true} color="red" class="mb-4">
            <span class="font-medium">Invalid branch name and key.
        </Alert>
        {/if}
        {#if form?.duplicateentry}
        <Alert dismissable={true} accent={true} color="red" class="mb-4">
            <span class="font-medium">You need to use an unique branch key.
        </Alert>
        {/if}
        <form bind:this={addModal} class="space-y-6" action="?/addbranch" on:submit|preventDefault={handleSubmit} method="POST">
            <input type="hidden" name="branchID" value={updateBranchID} />
            <Label class="space-y-2">
                <span>Name</span>
                <Input type="text" name="branchName" placeholder="Name of this branch" maxlength="200" value={form?.branchName ?? branchName} required  />
            </Label>
            <Label class="space-y-2">
                <span>Branch Key</span>
                <Input type="text" name="branchKey" placeholder="Access Key for display panels" maxlength="30" value={branchKey} required  />
            </Label>
        </form>
        <svelte:fragment slot='footer'>
            <Button color="alternative">Cancel</Button>
            <Button color="green" on:click={() => handleSubmit() }>Save</Button>
        </svelte:fragment>
    </Modal>
    {#if form?.deletesuccess}
    <Alert dismissable={true} accent={true} color="green" class="mb-4">
        <span class="font-medium">Branch Removed.
    </Alert>
    {/if}
    {#if form?.success}
    <Alert dismissable={true} accent={true} color="green" class="mb-4">
        <span class="font-medium">Branch Added.
    </Alert>
    {/if}
    {#if form?.updatesuccess}
    <Alert dismissable={true} accent={true} color="green" class="mb-4">
        <span class="font-medium">Branch Updated.
    </Alert>
    {/if}
    <Button color="blue" on:click={() => {showBranchDetails()}}>Add new Branch</Button>
    <Table striped={true} class="mt-6">
        <TableHead>
            <TableHeadCell>No.</TableHeadCell>
            <TableHeadCell>Branch Name</TableHeadCell>
            <TableHeadCell>Branch Key</TableHeadCell>
            <TableHeadCell>
                <span class="sr-only"> Edit </span>
            </TableHeadCell>
            <TableHeadCell>
                <span class="sr-only"> Delete </span>
            </TableHeadCell>
        </TableHead>
        <TableBody>
        {#each branches as branch, index}
            <TableBodyRow>
                <TableBodyCell>{index+1}</TableBodyCell>
                <TableBodyCell>{branch.branchName}<br /><span class="text-gray-500 text-xs">ID: {branch.branchID}</span></TableBodyCell>
                <TableBodyCell>{branch.branchKey}</TableBodyCell>
                <TableBodyCell>
                    <Button color="alternative" on:click={() => updateBranch(branch.branchID, branch.branchName, branch.branchKey)}>Edit</Button>
                </TableBodyCell>
                <TableBodyCell>
                    <Button color="alternative" on:click={() => deleteBranchConfirmation(branch.branchID, branch.branchName)}>Delete</Button>
                </TableBodyCell>
            </TableBodyRow>
        {/each}
        </TableBody>
    </Table>
</div>