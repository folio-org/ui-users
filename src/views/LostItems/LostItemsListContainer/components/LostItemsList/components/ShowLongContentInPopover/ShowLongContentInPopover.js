import PropTypes from 'prop-types';

import {
  InfoPopover,
} from '@folio/stripes/components';

const defaultContentLength = 75;
const buttonProps = {
  icon: 'ellipsis',
  iconSize: 'medium',
};

export const getComponentText = (text, contentLength = defaultContentLength) => {
  if (text.length > contentLength) {
    let splitPosition = text.slice(0, contentLength + 1).lastIndexOf(' ');
    splitPosition = splitPosition > 0 ? splitPosition : contentLength;

    return {
      contentText: text.slice(0, splitPosition),
      popoverText: text,
    };
  }

  return {
    contentText: text,
    popoverText: '',
  };
};

const ShowLongContentInPopover = ({
  text,
  contentLength,
}) => {
  const {
    contentText,
    popoverText,
  } = getComponentText(text, contentLength);

  return (
    <div data-testid="longContentInPopover">
      {contentText}
      {popoverText && <InfoPopover
        content={popoverText}
        buttonProps={buttonProps}
        data-testid="infoPopover"
      />}
    </div>
  );
};

ShowLongContentInPopover.propTypes = {
  text: PropTypes.string.isRequired,
  contentLength: PropTypes.number,
};

ShowLongContentInPopover.defaultProps = {
  contentLength: defaultContentLength,
};

export default ShowLongContentInPopover;
