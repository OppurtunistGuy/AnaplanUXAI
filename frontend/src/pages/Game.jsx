import React from "react";
import { useGame } from "../store/gameStore";
import { PhoneShell, PageBackdrop } from "../components/PhoneShell";

import Landing from "./Landing";
import Setup from "./Setup";
import Level1Question from "../screens/Level1Question";
import {
  Level1Locked,
  Level1Handoff,
  Level1BothAnswered,
  Level1Complete,
  Level1DeclinePrompt,
} from "../screens/Level1Flow";
import {
  Level2Dice,
  Level2Category,
  Level2Cards,
  Level2CardFlip,
  Level2Question,
  Level2Locked,
  Level2Handoff,
  Level2BothAnswered,
} from "../screens/Level2Flow";
import Insights from "./Insights";
import { Level3Teaser, InactivityEnd, Closure } from "../screens/MetaScreens";

const SCREENS = {
  "landing": Landing,
  "setup": Setup,
  "l1-question": Level1Question,
  "l1-locked": Level1Locked,
  "l1-handoff": Level1Handoff,
  "l1-both": () => <Level1BothAnswered final={false} />,
  "l1-both-final": () => <Level1BothAnswered final={true} />,
  "l1-complete": Level1Complete,
  "l1-decline-prompt": Level1DeclinePrompt,
  "l2-dice": Level2Dice,
  "l2-category": Level2Category,
  "l2-cards": Level2Cards,
  "l2-card-flip": Level2CardFlip,
  "l2-question": Level2Question,
  "l2-locked": Level2Locked,
  "l2-handoff": Level2Handoff,
  "l2-both": Level2BothAnswered,
  "insights": Insights,
  "l3-teaser": Level3Teaser,
  "inactivity-end": InactivityEnd,
  "closure": Closure,
};

export default function Game() {
  const { state } = useGame();
  const Component = SCREENS[state.phase] || Landing;
  return (
    <PageBackdrop>
      <PhoneShell keyId={state.phase}>
        <Component />
      </PhoneShell>
    </PageBackdrop>
  );
}
