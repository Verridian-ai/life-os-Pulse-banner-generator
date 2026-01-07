import { z } from 'zod';

export const WriteEnhancedPromptSchema = z.object({
    prompt: z.string(),
    industry: z.string().optional(),
    style: z.string().optional(),
});

export const GenerateBackgroundSchema = z.object({
    prompt: z.string(),
    quality: z.enum(['1K', '2K', '4K']).optional(),
});

export const RemoveBackgroundSchema = z.object({
    image_url: z.string().optional(),
});

export const UpscaleImageSchema = z.object({
    image_url: z.string(),
    mode: z.enum(['fast', 'balanced', 'best']).optional(),
});

export const RestoreImageSchema = z.object({
    image_url: z.string(),
});

export const EnhanceFaceSchema = z.object({
    image_url: z.string(),
});

export const MagicEditSchema = z.object({
    prompt: z.string(),
    base_image: z.string().optional(),
});

export const AnalyzeImageSchema = z.object({
    image_url: z.string().optional(),
});

export const AnalyzeBannerSchema = z.object({});

export const CompareImagesSchema = z.object({
    target_image: z.string().optional(),
    reference_image: z.string().optional(),
});

export const AddTextElementSchema = z.object({
    text: z.string(),
    x: z.number().optional(),
    y: z.number().optional(),
    fontSize: z.number().optional(),
    color: z.string().optional(),
    fontFamily: z.string().optional(),
});

export const UpdateElementSchema = z.object({
    element_id: z.string(),
    properties: z.record(z.string(), z.unknown()), // We can be more specific if we know exact updateable properties
});

export const DeleteElementSchema = z.object({
    element_id: z.string(),
});

export const BringToFrontSchema = z.object({
    element_id: z.string(),
});

export const SendToBackSchema = z.object({
    element_id: z.string(),
});

export const DuplicateElementSchema = z.object({
    element_id: z.string(),
});

export const LockElementSchema = z.object({
    element_id: z.string(),
});

export const GroupElementsSchema = z.object({
    element_ids: z.array(z.string()),
});

export const ListElementsSchema = z.object({});

export const NavigateToTabSchema = z.object({
    tab: z.enum(['studio', 'gallery', 'brainstorm']),
});

export const UndoActionSchema = z.object({});

export const RedoActionSchema = z.object({});

export const BatchUpscaleSchema = z.object({
    image_urls: z.array(z.string()),
    mode: z.enum(['fast', 'balanced', 'best']).optional(),
});

export const BatchRemoveBackgroundSchema = z.object({
    image_urls: z.array(z.string()),
});

export const ToolSchemas: Record<string, z.ZodType<unknown>> = {
    write_enhanced_prompt: WriteEnhancedPromptSchema,
    generate_background: GenerateBackgroundSchema,
    remove_background: RemoveBackgroundSchema,
    upscale_image: UpscaleImageSchema,
    restore_image: RestoreImageSchema,
    enhance_face: EnhanceFaceSchema,
    magic_edit: MagicEditSchema,
    analyze_image: AnalyzeImageSchema,
    analyze_banner: AnalyzeBannerSchema,
    compare_images: CompareImagesSchema,
    add_text_element: AddTextElementSchema,
    update_element: UpdateElementSchema,
    delete_element: DeleteElementSchema,
    list_elements: ListElementsSchema,
    navigate_to_tab: NavigateToTabSchema,
    undo_action: UndoActionSchema,
    redo_action: RedoActionSchema,
    batch_upscale: BatchUpscaleSchema,
    batch_remove_background: BatchRemoveBackgroundSchema,
    bring_to_front: BringToFrontSchema,
    send_to_back: SendToBackSchema,
    duplicate_element: DuplicateElementSchema,
    lock_element: LockElementSchema,
    group_elements: GroupElementsSchema,
};
