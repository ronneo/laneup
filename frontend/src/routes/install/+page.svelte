<script lang="ts">
    import {
        Label,
        Input,
        Button,
        Card,
        Alert,
        DarkMode
    } from 'flowbite-svelte'

    export let form

    let btnClass = 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xl p-2 right-2 top-2 fixed';
</script>
<DarkMode {btnClass} />
<div class="h-screen flex justify-center items-center">
    <Card class="w-11/12">
        <form class="flex flex-col space-y-6" method="POST">
            <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Create new admin</h3>
            {#if form?.incorrect}
            <Alert dismissable={true} accent={true} color="red">
                <span class="font-medium">Invalid Email
            </Alert>
            {/if}
            {#if form?.passwordIncorrect}
            <Alert dismissable={true} accent={true} color="red">
                <span class="font-medium">Password does not match
            </Alert>
            {/if}
            <Label class="space-y-2">
                <span>Email</span>
                <Input type="email" name="email" placeholder="name@company.com" required value={form?.email ?? ''}/>
            </Label>
            <Label class="space-y-2">
                <span>Your new password</span>
                <Input type="password" name="password" placeholder="" required />
            </Label>
            <Label class="space-y-2">
                <span>Confirm password</span>
                <Input type="password" name="passwordc" placeholder="" required />
            </Label>
            <Button color="blue" type="submit" class="w-full1">Create Admin Account</Button>
        </form>
    </Card>
</div>
