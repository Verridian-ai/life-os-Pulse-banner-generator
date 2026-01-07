/**
 * Extracts PROMPT: markers from message text
 *
 * This utility searches for PROMPT: markers in AI-generated messages
 * and extracts the prompts that follow them. These extracted prompts
 * can be used to generate new designs with a single click.
 *
 * @param text - The message text to search for PROMPT: markers
 * @returns Array of extracted prompt strings (trimmed)
 *
 * @example
 * ```typescript
 * const text = "Here are some ideas:\nPROMPT: A mountain landscape\nPROMPT: Ocean sunset";
 * const prompts = extractPrompts(text);
 * // prompts = ["A mountain landscape", "Ocean sunset"]
 * ```
 */
export const extractPrompts = (text: string): string[] => {
  const regex = /PROMPT:(.*?)(?=\n|$)/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
};
