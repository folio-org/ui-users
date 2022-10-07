import PropTypes from 'prop-types';

import {
  InfoPopover,
} from '@folio/stripes/components';

import css from './ShowLongContentInPopover.css';

const defaultAdditionalText = '';
const defaultContentLength = 75;
const buttonProps = {
  icon: 'ellipsis',
  iconSize: 'medium',
};

export const getComponentText = (text, additionalText = defaultAdditionalText, contentLength = defaultContentLength) => {
  const contentAdditionalText = additionalText ? ` (${additionalText})` : '';

  if (text.length > contentLength) {
    let splitPosition = text.slice(0, contentLength + 1).lastIndexOf(' ');
    splitPosition = splitPosition > 0 ? splitPosition : contentLength;

    return {
      contentText: text.slice(0, splitPosition),
      popoverText: text + contentAdditionalText,
    };
  }

  return {
    contentText: text + contentAdditionalText,
    popoverText: '',
  };
};

const ShowLongContentInPopover = ({
  text,
  additionalText,
  contentLength,
}) => {
  const {
    contentText,
    popoverText,
  } = getComponentText(text, additionalText, contentLength);
  const infoPopoverContent = <div className={css.longContentInPopover}>{popoverText}</div>;

  return (
    <div data-testid="longContentInPopover">
      {contentText}
      {popoverText && <InfoPopover
        content={infoPopoverContent}
        buttonProps={buttonProps}
        data-testid="infoPopover"
      />}
    </div>
  );
};

ShowLongContentInPopover.propTypes = {
  text: PropTypes.string.isRequired,
  additionalText: PropTypes.string,
  contentLength: PropTypes.number,
};

ShowLongContentInPopover.defaultProps = {
  additionalText: defaultAdditionalText,
  contentLength: defaultContentLength,
};

export default ShowLongContentInPopover;
