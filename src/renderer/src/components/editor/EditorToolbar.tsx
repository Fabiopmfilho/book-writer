import type { ReactNode } from 'react'

import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2
} from 'lucide-react'

import {
  editorFontFamilies,
  editorFontSizes,
  normalizeFontFamily,
  type SelectOption
} from './editorFonts'

type EditorToolbarProps = {
  editor: Editor | null
}

type ToolbarButtonProps = {
  label: string
  shortcut?: string
  /** Omita em botões de ação (desfazer, refazer, separador). */
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

type ToolbarSelectProps = {
  label: string
  className: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
}

const iconProps = { size: 18, strokeWidth: 1.75, 'aria-hidden': true } as const

function ToolbarButton({
  label,
  shortcut,
  active,
  disabled,
  onClick,
  children
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={active ? 'active' : ''}
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

function ToolbarSelect({ label, className, value, options, onChange }: ToolbarSelectProps) {
  const isKnownValue = options.some((option) => option.value === value)

  return (
    <select
      className={`editor-toolbar-select ${className}`}
      aria-label={label}
      title={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {!isKnownValue && <option value={value}>Outra</option>}
    </select>
  )
}

function Divider() {
  return <span className="editor-toolbar-divider" role="separator" />
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      const textStyle = ctx.editor.getAttributes('textStyle')

      return {
        canUndo: ctx.editor.can().undo(),
        canRedo: ctx.editor.can().redo(),
        bold: ctx.editor.isActive('bold'),
        italic: ctx.editor.isActive('italic'),
        underline: ctx.editor.isActive('underline'),
        strike: ctx.editor.isActive('strike'),
        highlight: ctx.editor.isActive('highlight'),
        paragraph: ctx.editor.isActive('paragraph'),
        h1: ctx.editor.isActive('heading', { level: 1 }),
        h2: ctx.editor.isActive('heading', { level: 2 }),
        h3: ctx.editor.isActive('heading', { level: 3 }),
        bulletList: ctx.editor.isActive('bulletList'),
        orderedList: ctx.editor.isActive('orderedList'),
        blockquote: ctx.editor.isActive('blockquote'),
        alignLeft: ctx.editor.isActive({ textAlign: 'left' }),
        alignCenter: ctx.editor.isActive({ textAlign: 'center' }),
        alignRight: ctx.editor.isActive({ textAlign: 'right' }),
        alignJustify: ctx.editor.isActive({ textAlign: 'justify' }),
        fontFamily: (textStyle.fontFamily as string | undefined) ?? '',
        fontSize: (textStyle.fontSize as string | undefined) ?? ''
      }
    }
  })

  const currentFont =
    editorFontFamilies.find(
      (font) => normalizeFontFamily(font.value) === normalizeFontFamily(state.fontFamily)
    )?.value ?? state.fontFamily

  const changeFontFamily = (value: string) => {
    if (value === '') {
      editor.chain().focus().unsetFontFamily().run()
    } else {
      editor.chain().focus().setFontFamily(value).run()
    }
  }

  const changeFontSize = (value: string) => {
    if (value === '') {
      editor.chain().focus().unsetFontSize().run()
    } else {
      editor.chain().focus().setFontSize(value).run()
    }
  }

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatação do texto">
      <ToolbarButton
        label="Desfazer"
        shortcut="Ctrl+Z"
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Refazer"
        shortcut="Ctrl+Shift+Z"
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 {...iconProps} />
      </ToolbarButton>

      <Divider />

      <ToolbarSelect
        label="Fonte"
        className="editor-toolbar-select--font"
        value={currentFont}
        options={editorFontFamilies}
        onChange={changeFontFamily}
      />

      <ToolbarSelect
        label="Tamanho da fonte"
        className="editor-toolbar-select--size"
        value={state.fontSize}
        options={editorFontSizes}
        onChange={changeFontSize}
      />

      <Divider />

      <ToolbarButton
        label="Negrito"
        shortcut="Ctrl+B"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Itálico"
        shortcut="Ctrl+I"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Sublinhado"
        shortcut="Ctrl+U"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Tachado"
        shortcut="Ctrl+Shift+S"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Destacar trecho"
        shortcut="Ctrl+Shift+H"
        active={state.highlight}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter {...iconProps} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Parágrafo"
        active={state.paragraph}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Título 1"
        active={state.h1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Título 2"
        active={state.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Título 3"
        active={state.h3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 {...iconProps} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Alinhar à esquerda"
        shortcut="Ctrl+Shift+L"
        active={state.alignLeft}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeft {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Centralizar"
        shortcut="Ctrl+Shift+E"
        active={state.alignCenter}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenter {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Alinhar à direita"
        shortcut="Ctrl+Shift+R"
        active={state.alignRight}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRight {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Justificar"
        shortcut="Ctrl+Shift+J"
        active={state.alignJustify}
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <AlignJustify {...iconProps} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Lista com marcadores"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Lista numerada"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Citação"
        active={state.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote {...iconProps} />
      </ToolbarButton>

      <ToolbarButton
        label="Quebra de cena"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus {...iconProps} />
      </ToolbarButton>
    </div>
  )
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null
  }

  return <Toolbar editor={editor} />
}

export default EditorToolbar
