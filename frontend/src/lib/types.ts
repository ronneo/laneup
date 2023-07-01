type BranchGroups = {
    groupID:number,
    groupName:string,
}
type BranchGroupsAllInfo = {
    groupID:number,
    groupName:string,
    count:number,
    nextQueue:number,
    nextQueueID:number,
    queue:Array<{id:number, queue:string}>
}
type BranchInfo = {
    groups:Array<BranchGroups> | null,
    branchID:number
}
type StatusInfo = {
    timestamp:string,
    queue:string,
    status:string,
    branchKey:string
}

export type {
    BranchGroups,
    BranchGroupsAllInfo,
    BranchInfo,
    StatusInfo
}