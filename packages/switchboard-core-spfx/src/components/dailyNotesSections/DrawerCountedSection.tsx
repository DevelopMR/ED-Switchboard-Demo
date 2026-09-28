import * as React from "react";
import { SwDrawerCountState } from "../../models/SwDrawerCountState";
import { formatShortUserStamp } from "../../utils/dateFormatting";
import { SectionBand } from "../shared/SectionBand";

export interface DrawerCountedSectionProps {
  state: SwDrawerCountState;
  onToggleSlot: (slot: number) => void;
}

export function DrawerCountedSection(props: DrawerCountedSectionProps): JSX.Element {
  return (
    <section className="swFormSection">
      <SectionBand title="Drawer Counted?" subtitle="(Operator initials)" />
      <div className="swDrawerRow">
        {props.state.boxes.map((box) => (
          <button className="swDrawerBox" key={box.slot} type="button" onClick={() => props.onToggleSlot(box.slot)}>
            {formatShortUserStamp(box.countedAt, box.countedBy)}
          </button>
        ))}
      </div>
    </section>
  );
}
