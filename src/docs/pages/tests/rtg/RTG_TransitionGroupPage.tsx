import { TransitionGroup } from "react-transition-group";
import Fade from '@mui/material/Fade';

export const RTG_TransitionGroupPage: React.FC = () => {
  const label = 'březen 2026';
  return <TransitionGroup className="MuiPickersFadeTransitionGroup-root">
    <Fade
      appear={false}
      mountOnEnter
      unmountOnExit
      key={label}
      timeout={{
        appear: 225,
        enter: 225,
        exit: 0,
      }}
    >
      <span>{label}</span>
    </Fade>
  </TransitionGroup>
}