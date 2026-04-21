const NavItem = ({ icon, label, active=false }: { icon: React.ReactNode, label: string, active: boolean }) => {
  return (
    <div>
      {icon}
      {label}
    </div>
  )
}

export default NavItem