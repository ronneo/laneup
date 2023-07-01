<script lang="ts">
    import {goto} from '$app/navigation';
    import BranchKey from '$lib/components/BranchKey.svelte'

    export let data
    
    let branchKey:string = ''

    const handleSubmit = () => {
        goto('/new/'+branchKey)
    }

</script>

<BranchKey onclick={handleSubmit} error={data.error} bind:value={branchKey} />
