<script lang="ts">
    import {
        Label,
        Input,
        Checkbox,
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
    <Card class="w-4/12">
        <form class="flex flex-col space-y-6" method="POST">
            <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Sign in</h3>
            {#if form?.incorrect}
            <Alert dismissable={true} accent={true} color="red">
                <span class="font-medium">Invalid Email
            </Alert>
            {/if}
            {#if form?.invalid}
            <Alert dismissable={true} accent={true} color="red">
                <span class="font-medium">Incorrect Email or password
            </Alert>
            {/if}
            <Label class="space-y-2">
                <span>Email</span>
                <Input type="email" name="email" placeholder="name@company.com" required value={form?.email ?? ''}/>
            </Label>
            <Label class="space-y-2">
                <span>Your password</span>
                <Input type="password" name="password" placeholder="•••••" required />
            </Label>
            <div class="flex items-start">
                <Checkbox name="remember">Remember me</Checkbox>
            </div>
            <Button color="blue" type="submit" class="w-full1">Login to your account</Button>
        </form>
    </Card>
</div>
