<script lang="ts">
    import {Heading, Input, Label, Button, Alert} from 'flowbite-svelte'

    export let form
</script>
<div class="border-t border-gray-200 p-4 pt-8 dark:border-gray-600">
    <Heading tag="h4" class="text-gray-100 dark:text-gray-400 mb-3">Edit your password</Heading>
    {#if form?.success}
    <Alert dismissable={true} accent={true} color="green" class="mb-4">
        <span class="font-medium">Password updated successfully.
    </Alert>
    {/if}
    {#if form?.passwordmatch}
    <Alert dismissable={true} accent={true} color="red" class="mb-4">
        <span class="font-medium">Your passwords do not match.
    </Alert>
    {/if}
    {#if form?.invalid}
    <Alert dismissable={true} accent={true} color="red" class="mb-4">
        <span class="font-medium">We are unable to update your password. Please contact the system administrators.
    </Alert>
    {/if}
    {#if form?.passworderror}
    <Alert dismissable={true} accent={true} color="red" class="mb-4">
        <span class="font-medium">Please ensure that your password is at least 8 characters long and contain lower and uppcase alphabet with digits.
    </Alert>
    {/if}
    <form class="flex flex-col space-y-8" method="POST">
    <Label class="space-y-2">
        <span>Password</span>
        <Input type="password" name="password" placeholder="****" required />
    </Label>
    <Label class="space-y-2">
        <span>Confirm Password</span>
        <Input type="password" name="passwordconfirm" placeholder="" required />
    </Label>
    <Button color="blue" type="submit" class="w-1/5">Update</Button>
    </form>
</div>