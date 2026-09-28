import * as React from "react";
import { SwMenuRole } from "../../models/SwMenuRole";
import { SwReferenceLinkGroup, SwReferenceLinkGroups, SwReferenceLinkItem } from "../../models/SwReferenceLinkItem";

export interface ReferenceLinksMenuProps {
  links: SwReferenceLinkItem[];
  role: SwMenuRole;
  previewRole?: SwMenuRole;
}

const roleGroups: Record<SwMenuRole, SwReferenceLinkGroup[]> = {
  Operator: ["Reference", "Operations", "Policies"],
  Manager: ["Reference", "Operations", "Policies", "Manager"],
  Admin: ["Reference", "Operations", "Policies", "Manager", "Admin"]
};

function renderReferenceIcon(iconKey?: string): JSX.Element | undefined {
  const normalized = (iconKey ?? "").trim().toLowerCase();

  switch (normalized) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10.5V20h13v-9.5" />
          <path d="M9.5 20v-6h5v6" />
        </svg>
      );
    case "document":
    case "file":
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path d="M7 3.5h7l3 3V20.5H7z" />
          <path d="M14 3.5v4h4" />
          <path d="M9.5 12h5" />
          <path d="M9.5 15h5" />
        </svg>
      );
    case "info":
    case "information":
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 10.5v5" />
          <path d="M12 7.5h.01" />
        </svg>
      );
    case "list":
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path d="M9 7h10" />
          <path d="M9 12h10" />
          <path d="M9 17h10" />
          <path d="M5 7h.01" />
          <path d="M5 12h.01" />
          <path d="M5 17h.01" />
        </svg>
      );
    case "settings":
    case "gear":
      return (
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v3" />
          <path d="M12 17.5v3" />
          <path d="M3.5 12h3" />
          <path d="M17.5 12h3" />
          <path d="m6 6 2.1 2.1" />
          <path d="m15.9 15.9 2.1 2.1" />
          <path d="m18 6-2.1 2.1" />
          <path d="m8.1 15.9-2.1 2.1" />
        </svg>
      );
    default:
      return undefined;
  }
}

export function ReferenceLinksMenu(props: ReferenceLinksMenuProps): JSX.Element {
  const visibleGroups = roleGroups[props.role];
  const groupedLinks = new Map<SwReferenceLinkGroup, SwReferenceLinkItem[]>();

  for (const group of SwReferenceLinkGroups) {
    groupedLinks.set(
      group,
      props.links.filter((link) => link.group === group && visibleGroups.includes(group))
    );
  }

  const groupsToRender = visibleGroups.filter((group) => (groupedLinks.get(group) ?? []).length > 0);

  if (groupsToRender.length === 0) {
    return <></>;
  }

  const openLink = (event: React.MouseEvent<HTMLButtonElement>, link: SwReferenceLinkItem): void => {
    event.preventDefault();
    event.stopPropagation();

    if (link.openInNewWindow) {
      const newWindow = window.open(link.url, "_blank", "noopener,noreferrer,popup=true");

      if (newWindow) {
        newWindow.opener = null;
        newWindow.focus();
      }

      return;
    }

    window.location.assign(link.url);
  };

  return (
    <div className="swReferenceMenu">
      {props.previewRole ? <div className="swMenuPreviewPill">Menu preview: {props.previewRole}</div> : null}
      {groupsToRender.map((group) => {
        const links = groupedLinks.get(group) ?? [];

        return (
          <section key={group} className="swReferenceMenuSection" aria-label={`${group} links`}>
            <ul className="swReferenceMenuList">
              {links.map((link) => {
                const icon = renderReferenceIcon(link.iconKey);

                return (
                  <li key={link.id} className="swReferenceMenuItem">
                    <button className="swReferenceMenuLink" type="button" onClick={(event) => openLink(event, link)}>
                      {icon ? (
                        <span className="swReferenceMenuIcon" aria-hidden="true">
                          {icon}
                        </span>
                      ) : null}
                      <span className="swReferenceMenuLinkTitle">{link.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

