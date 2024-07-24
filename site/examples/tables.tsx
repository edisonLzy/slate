import React, { useCallback, useMemo } from 'react'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import {
  Editor,
  Range,
  Point,
  Descendant,
  createEditor,
  Element as SlateElement,
} from 'slate'
import { withHistory } from 'slate-history'


if(globalThis){
  globalThis.ReactEditor = ReactEditor;
}


const TablesExample = () => {
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const editor = useMemo(
    () => withTables(withHistory(withReact(createEditor()))),
    []
  )

  if(globalThis){
    globalThis.ReactEditor = ReactEditor;
    globalThis.editor = editor;
  }


  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable
        onPointerDown={e => {

          // 获取到最近的element节点
          const range = ReactEditor.findEventRange(editor, e)
          const end = Range.end(range)
          const nodes = [...Editor.nodes(editor, {
            at: end,
            match: n => SlateElement.isElement(n)
          })];

          const [node] = nodes[0];

          console.log(ReactEditor.toSlateNode(editor, e.target as HTMLElement));
        }}
        renderElement={renderElement} renderLeaf={renderLeaf} />
    </Slate>
  )
}

const withTables = editor => {
  const { deleteBackward, deleteForward, insertBreak } = editor

  editor.deleteBackward = unit => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'table-cell',
      })

      if (cell) {
        const [, cellPath] = cell
        const start = Editor.start(editor, cellPath)

        if (Point.equals(selection.anchor, start)) {
          return
        }
      }
    }

    deleteBackward(unit)
  }

  editor.deleteForward = unit => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'table-cell',
      })

      if (cell) {
        const [, cellPath] = cell
        const end = Editor.end(editor, cellPath)

        if (Point.equals(selection.anchor, end)) {
          return
        }
      }
    }

    deleteForward(unit)
  }

  editor.insertBreak = () => {
    const { selection } = editor

    if (selection) {
      const [table] = Editor.nodes(editor, {
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'table',
      })

      if (table) {
        return
      }
    }

    insertBreak()
  }

  return editor
}

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'table':
      return (
        <table {...attributes}>
          <tbody>{children}</tbody>
        </table>
      )
    case 'table-row':
      return <tr {...attributes}>{children}</tr>
    case 'table-cell':
      return <td {...attributes}>{children}</td>

    case 'callout':
      return (
        <div
          {...attributes}
          className='callout-block'
          style={{
            border: '2px solid #ddd',
            padding: '16px',
            paddingLeft: '30px',
            display: 'flex', gap: 5
          }}
        >
          <div
            contentEditable={false}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'green',
            }}></div>
          <div>
            {children}
          </div>
        </div>
      )
    default:
      return <p
        className='text-block'
        {...attributes}>{children}</p>
  }
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  return <span {...attributes}>{children}</span>
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
      },
    ],
  },
  {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Pig', bold: true }],
              }
            ],
          },
          {
            type: 'table-cell',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Pig', bold: true }],
              },
              {
                type: 'callout',
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      {
                        text: 'This is another custom block type!',
                      }
                    ]
                  }
                ]
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'callout',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'This is another custom block type!',
          }
        ]
      }
    ]
  }
]

export default TablesExample
