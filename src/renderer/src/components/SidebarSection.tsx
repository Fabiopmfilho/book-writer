import { useState, type ReactNode } from 'react'

type SidebarSectionProps = {
  title: string
  createTitle: string
  children: ReactNode
  onCreate: () => void
}

function SidebarSection({ title, createTitle, children, onCreate }: SidebarSectionProps) {
  const [open, setOpen] = useState(false)

  function createItem() {
    setOpen(true)
    onCreate()
  }

  return (
    <section className="sidebar-section">
      <div className="sidebar-section-header">
        <button
          type="button"
          className="sidebar-section-toggle"
          onClick={() => setOpen((currentOpen) => !currentOpen)}
          aria-expanded={open}
        >
          <span className="section-chevron">{open ? '▾' : '▸'}</span>

          <span>{title}</span>
        </button>

        <button
          type="button"
          className="sidebar-section-add"
          onClick={createItem}
          title={createTitle}
          aria-label={createTitle}
        >
          +
        </button>
      </div>

      {open && children}
    </section>
  )
}

export default SidebarSection
