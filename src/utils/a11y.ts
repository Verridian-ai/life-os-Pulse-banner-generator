/**
 * Global accessibility helpers to ensure strict compliance (WCAG/Axe)
 * and type safety across the application.
 */

/**
 * Generates standardized ARIA props for a dropdown trigger button.
 * Ensures proper linkage via aria-controls and valid state values.
 * 
 * @param isOpen - Current open state of the dropdown
 * @param controlsId - The ID of the element being controlled (the dropdown menu)
 * @param label - Accessible label for the button
 * @param popupType - The type of popup (default: 'listbox')
 * @returns Object containing standard ARIA props
 */
export const getDropdownAria = (
    isOpen: boolean,
    controlsId: string,
    label: string,
    popupType: 'listbox' | 'menu' = 'listbox'
) => ({
    'aria-haspopup': popupType,
    'aria-expanded': isOpen,
    'aria-controls': isOpen ? controlsId : undefined,
    'aria-label': label,
});

/**
 * Generates standardized ARIA props for a selectable option (e.g., in a listbox).
 * 
 * @param isSelected - Whether the option is currently selected
 * @returns Object containing standard ARIA props
 */
export const getOptionAria = (isSelected: boolean) => ({
    role: 'option',
    'aria-selected': isSelected,
});

/**
 * Generates standardized ARIA props for a listbox container.
 * 
 * @param label - Accessible label for the listbox
 * @returns Object containing standard ARIA props
 */
export const getListboxAria = (label: string) => ({
    role: 'listbox',
    'aria-label': label,
});
