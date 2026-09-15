export default async function Layout({
    children
}: LayoutProps<'/[set]'>) {
    return(
        <div>
            {children}
        </div>
    )
}