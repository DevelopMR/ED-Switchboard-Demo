import * as React from "react";
import { SwMenuRole } from "../../models/SwMenuRole";
import { SwReferenceLinkItem } from "../../models/SwReferenceLinkItem";
import { ISwReferenceLinksService } from "../../services/contracts/ISwReferenceLinksService";
import { ReferenceLinksMenu } from "./ReferenceLinksMenu";

export interface LeftNavMenuProps {
  referenceLinksService: ISwReferenceLinksService;
  menuRoleOverride?: SwMenuRole;
}

export function LeftNavMenu(props: LeftNavMenuProps): JSX.Element {
  const [links, setLinks] = React.useState<SwReferenceLinkItem[]>([]);

  React.useEffect(() => {
    let isMounted = true;

    props.referenceLinksService
      .getLinks()
      .then((loadedLinks) => {
        if (isMounted) {
          setLinks(loadedLinks);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLinks([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [props.referenceLinksService]);

  const effectiveRole: SwMenuRole = props.menuRoleOverride ?? "Operator";

  return (
    <aside className="swLeftNavRail" aria-label="Switchboard navigation">
      <ReferenceLinksMenu links={links} role={effectiveRole} previewRole={props.menuRoleOverride} />
    </aside>
  );
}
