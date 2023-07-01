<script lang="ts">
	import '../../app.postcss';
    import { onMount } from 'svelte';
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		Drawer,
		CloseButton,
		DarkMode
	} from 'flowbite-svelte'
    import { sineIn } from 'svelte/easing'

    let breakPoint: number = 1024
    let width: number;
    let drawerHidden: boolean = false
    let activateClickOutside: boolean = true
    let backdrop: boolean = false
	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	}
	$: if (width >= breakPoint) {
		drawerHidden = false;
		activateClickOutside = false;
	} else {
		drawerHidden = true;
		activateClickOutside = true;
	}
	onMount(() => {
		if (width >= breakPoint) {
			drawerHidden = false;
			activateClickOutside = false;
		} else {
			drawerHidden = true;
			activateClickOutside = true;
		}
	})

	const toggleSide = () => {
		if (width < breakPoint) {
			drawerHidden = !drawerHidden;
		}
	}
	const toggleDrawer = () => {
		drawerHidden = false
	}

	let divClass = 'w-full md:block md:w-auto pr-8'
	let ulClass = 'flex flex-col p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm'
	let darkmodebtn = 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-lg p-2.5 fixed right-2 top-12  md:top-4 md:right-4 z-50'
</script>
<svelte:window bind:innerWidth={width} />
<Navbar let:hidden let:toggle class="dark:bg-neutral-900">
	<NavHamburger on:click={toggleDrawer} btnClass="ml-3 lg:hidden" />
    <NavBrand href="/" class="lg:ml-64"></NavBrand>
	<NavHamburger on:click={toggle} />
    <NavUl {hidden} {divClass} {ulClass}>
        <NavLi href="/admin">Home</NavLi>
		<NavLi href="/admin/settings">Settings</NavLi>
		<NavLi href="/admin/signout">Log out</NavLi>
	</NavUl>
</Navbar>
<DarkMode btnClass={darkmodebtn} />
<Drawer
	transitionType="fly"
	{backdrop}
	{transitionParams}
	bind:hidden={drawerHidden}
	bind:activateClickOutside
	width="w-64"
	class="overflow-scroll pb-32"
	id="sidebar"
>
	<div class="flex items-center">
		<CloseButton on:click={() => (drawerHidden = true)} class="mb-4 dark:text-white lg:hidden" />
	</div>
	<Sidebar asideClass="w-54">
		<SidebarWrapper divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800">
			<SidebarGroup>
				<SidebarItem label="Home" href="/admin" on:click={toggleSide} active={false} />
                <SidebarItem label="Branches" href="/admin/branches" on:click={toggleSide} active={false} />
                <SidebarItem label="Groups" href="/admin/groups" on:click={toggleSide} active={false} />
			</SidebarGroup>
		</SidebarWrapper>
	</Sidebar>
</Drawer>

<div class="flex px-4 mx-auto w-full">
	<main class="lg:ml-64 w-full mx-auto">
		<slot />
	</main>
</div>
