import * as React from "react";

export interface ModuleLauncherCardProps {
  title: string;
  subtitle: string;
  iconSrc: string;
  iconAlt: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function ModuleLauncherCard(props: ModuleLauncherCardProps): JSX.Element {
  return (
    <button
      className="swModuleLauncherCard"
      type="button"
      title={props.iconAlt}
      aria-label={props.iconAlt}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      <span className="swModuleLauncherIconWrap">
        <img className="swModuleLauncherIcon" src={props.iconSrc} alt="" aria-hidden="true" />
      </span>
    </button>
  );
}
