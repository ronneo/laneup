<script lang="ts">
    import {goto} from '$app/navigation'
    import {slide,fade,fly} from 'svelte/transition'
    import {t} from '$lib/translations'
    import {Button,ButtonGroup,Toast} from 'flowbite-svelte'
    import type {BranchGroups} from '$lib/types'

    export let data;

    const ApiURL:string = data.ApiURL

    let mobile:string = "";
    let stage:number = 1;
    let groups:Array<BranchGroups> = data.groups;
    let groupID:number = 0;
    let groupName:string = "";
    let mobileError:string = "";

    const enterNumber = (num:string) => {
        if (mobile.length < 8) {
            mobile += num;
        }
    }
    const backspace = () => {
        mobile = mobile.substring(0, mobile.length - 1);
    }
    const formatNum = (currentm:string):string => {
        if (currentm.length > 6) {
            return currentm.substring(0, currentm.length-4) + " " + currentm.substring(currentm.length-4)
        } else {
            return currentm;
        }
    }
    const selectGroup = (id:number) => {
        groupID = id;
        groups.forEach(group => {
            if (groupID == group.groupID) {
                groupName = group.groupName;
            }
        });
        nextStage();
    }
    const checkMobile = ():boolean => {
        if (mobile === "") {
            mobileError = "Please key in your mobile number";
            return false;
        }
        if (mobile.length < 7) {
            mobileError = "Invalid Mobile Number";
            return false;
        }
        return true;
    }
    const nextStage = () => {
        mobileError = "";
        let validMobile = checkMobile();
        
        if (validMobile) {
            stage++;
        } else {
            setTimeout(function() {
                mobileError = "";
            }, 2000);
        }
    }
    const reset = () => {
        stage = 1;
        mobile = "";
        groupID = 0;
        groupName = "";
    }
    const back = () => {
        stage--;
    }
    const confirm = () => {
        let bodyVar = {"id":groupID, "mobile":mobile}
		fetch(ApiURL+'user/', {
            method:'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyVar),
        }).then(response => response.json())
        .then(data => {
            goto("/status/"+data.key+'?reset=1' ,{replaceState:true})
        })
    }
</script>
<div class="m-auto mt-5">
    <div class="text-center text-xl font-extrabold">Mobile number</div>
    <div class="text-center min-h-min text-5xl font-bold p-4 h-20 bg-zinc-800 text-white m-auto rounded-lg w-11/12">{formatNum(mobile)}</div>
    <div class="h-4"></div>
    {#if mobileError != ""} 
    <Toast transition={slide} color="red" class="m-auto">
        <svelte:fragment slot="icon">
            <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            <span class="sr-only">Error icon</span>
        </svelte:fragment>
        {mobileError}
    </Toast>
    {/if}
</div>
{#if stage == 1}
<div class="m-auto text-center" transition:slide|local>
    <div class="text-center text-md mb-1">Enter your phone no:</div>
    <div class="m-auto text-center w-11/12 md:w-2/3 lg:w-1/3 grid grid-cols-3 gap-3 mb-10">
        {#each ["1","2","3","4","5","6","7","8","9"] as num}
            <button class="inline-block rounded-md text-5xl border-slate-300 p-4 border hover:bg-slate-100 active:bg-slate-300" on:click={() => {enterNumber(num)}}>{num}</button>
        {/each}
        <button class="rounded-md text-5xl border-slate-300 p-4 border hover:bg-slate-100 active:bg-slate-300" on:click={backspace}>
            <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="currentColor" class="bi bi-backspace m-auto" viewBox="0 0 16 16">
            <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z"/>
            <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z"/>
          </svg>
        </button><button class="rounded-md text-5xl border-slate-300 p-4 border hover:bg-slate-100 active:bg-slate-300" on:click={() => {enterNumber("0")}}>0</button><div>&nbsp;</div>
    </div>
    <ButtonGroup>
        <Button size="xl" color="alternative" on:click={reset}>{$t('common.btn_reset')}</Button>
        <Button size="xl" color="green" on:click={nextStage}>{$t('common.btn_next')}</Button>
    </ButtonGroup>
</div>
{/if}
{#if stage == 2}
<div class="m-auto text-center" transition:slide|local>
    <div class="title">How many people are there in your group?</div>
    <div class="text-center grid grid-cols-2 gap-4 my-6 w-1/4 md:w-8/12 m-auto">
        {#each groups as group}
            <button class="rounded-md text-3xl border-slate-300 p-4 border hover:bg-slate-100 active:bg-slate-300" on:click={() => selectGroup(group.groupID)}>{group.groupName}</button>
        {/each}
    </div>
    <ButtonGroup>
        <Button size="xl" color="alternative" on:click={back}>{$t('common.btn_back')}</Button>
        <Button size="xl" color="red" on:click={reset}>{$t('common.btn_reset')}</Button>
    </ButtonGroup>
</div>
{/if}
{#if stage == 3}
<div class="m-auto text-center" transition:slide|local>
    <div class="text-4xl mb-10">
        {#if groupID == 0} No Group is selected 
        {:else} Table for {groupName} 
        {/if}
    </div>
    <div>&nbsp;</div>
    <Button size="xl" color="green" on:click={confirm} class="next">{$t('common.btn_confirm')}</Button>
    <div>&nbsp;</div>
    <ButtonGroup>
        <Button size="xl" color="alternative" on:click={back}>{$t('common.btn_back')}</Button>
        <Button size="xl" color="red" on:click={reset}>{$t('common.btn_reset')}</Button>
    </ButtonGroup>
    
</div>
{/if}  
