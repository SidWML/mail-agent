interface ActionFieldsProps {
  mailId?: string;
  /** The mail's version, so a change made by someone else is noticed. */
  version?: number;
  /** Address to come back to after the action. */
  returnTo: string;
}

/** The hidden inputs every action form needs. */
export default function ActionFields({ mailId, version, returnTo }: ActionFieldsProps) {
  return (
    <>
      {mailId && <input type="hidden" name="mailId" value={mailId} />}
      {version !== undefined && <input type="hidden" name="version" value={version} />}
      <input type="hidden" name="returnTo" value={returnTo} />
    </>
  );
}
