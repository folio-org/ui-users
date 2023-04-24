import PropTypes from 'prop-types';

import { useToggle } from '../../hooks';
import { AffiliationsManagerModal } from './AffiliationsManagerModal';
import AffiliationsManagerTrigger from './AffiliationsManagerTrigger';

const AffiliationsManager = ({
  disabled,
  onUpdateAffiliations,
  renderTrigger,
  userId,
  withTrigger,
}) => {
  const [isModalOpen, toggleModal] = useToggle(!withTrigger);

  return (
    <>
      {withTrigger && renderTrigger({ toggleModal, disabled })}

      {isModalOpen && (
        <AffiliationsManagerModal
          onClose={toggleModal}
          onSubmit={onUpdateAffiliations}
          userId={userId}
        />
      )}
    </>
  );
};

AffiliationsManager.propTypes = {
  disabled: PropTypes.bool,
  onUpdateAffiliations: PropTypes.func.isRequired,
  renderTrigger: PropTypes.func,
  userId: PropTypes.string.isRequired,
  withTrigger: PropTypes.bool,
};

AffiliationsManager.defaultProps = {
  disabled: false,
  renderTrigger: AffiliationsManagerTrigger,
  withTrigger: true,
};

export default AffiliationsManager;
