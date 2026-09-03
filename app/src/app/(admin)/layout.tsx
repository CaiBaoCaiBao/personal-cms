export default function Layout({
  children
}: {
  children: Readonly<React.ReactNode>
}) {
  return (
    <div>
      {children}
    </div>
  )
}