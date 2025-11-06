import { ReactNode } from "react"

interface props {
   className?: string
   children?: ReactNode
}

const Text = ({ className, children }: props) => {
   return <p className={className}>{children}</p>
}

export default Text