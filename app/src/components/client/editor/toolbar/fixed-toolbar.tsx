import {
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    DiffSourceToggleWrapper,
    InsertTable,
    CodeToggle,
    InsertThematicBreak,
    ListsToggle,
} from '@mdxeditor/editor';
export function FixedToolbar() {
    return (
        <DiffSourceToggleWrapper>
        <UndoRedo />
        <BoldItalicUnderlineToggles />
        <BlockTypeSelect />
        <InsertTable />
        <CodeToggle />
        <InsertThematicBreak />
        <ListsToggle />
        </DiffSourceToggleWrapper>
    )
}