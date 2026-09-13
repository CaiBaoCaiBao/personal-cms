export const hasPermission = (permissionGroups:string[], permissionCode:string) => {
  return permissionGroups.some(group => group === permissionCode)
}