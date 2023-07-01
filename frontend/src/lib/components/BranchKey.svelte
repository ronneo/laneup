<script lang="ts">
    import {Label, Alert, Card, Input, Button} from 'flowbite-svelte'

    export let error = false
    export let value = ''
    export let onclick = () => {}
    
    const handleSubmit = () => {
        onclick()
    }

</script>
<div class="h-screen flex justify-center items-center">
    <Card class="w-4/12">
        <form on:submit|preventDefault={handleSubmit}>
            <div class="flex flex-col space-y-6">
                <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Key Sign In</h3>
                {#if error}
                <Alert dismissable={true} accent={true} color="red">
                    <span class="font-medium">Invalid branch key
                </Alert>
                {/if}
                
                <Label class="space-y-2">
                    <span>Branch Key</span>
                    <Input type="text" name="branchKey" placeholder="" bind:value={value} required />
                </Label>
                <Button on:click={handleSubmit} color="blue" type="submit" class="w-full1">Submit</Button>
                
            </div>
        </form>
    </Card>
</div>