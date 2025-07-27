import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({ children, type }) => {
  const badgeStyles = {
    base: {
      display: 'inline-block',
      padding: '0.4em 0.8em',
      fontSize: '12px',
      fontWeight: '600',
      lineHeight: '1',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      verticalAlign: 'baseline',
      borderRadius: '10px',
      border: '1px solid',
    },
    variants: {
      primary: {
        backgroundColor: 'rgba(85, 110, 230, 0.18)',
        color: '#556ee6',
      },
      success: {
        backgroundColor: 'rgba(52, 195, 143, 0.18)',
        color: '#34c38f',
      },
      info: {
        backgroundColor: 'rgba(80, 165, 241, 0.18)',
        color: '#50a5f1',
      },
      warning: {
        backgroundColor: 'rgba(241, 180, 76, 0.18)',
        color: '#f1b44c',
      },
      danger: {
        backgroundColor: 'rgba(244, 106, 106, 0.18)',
        color: '#f46a6a',
      },
      secondary: {
        backgroundColor: 'rgba(108, 117, 125, 0.18)',
        color: '#6c757d',
      },
    },
  };

  const variantStyle = badgeStyles.variants[type] || badgeStyles.variants.primary;

  const style = {
    ...badgeStyles.base,
    backgroundColor: variantStyle.backgroundColor,
    color: variantStyle.color,
    borderColor: variantStyle.color,
  };

  return <span style={style}>{children}</span>;
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['primary', 'success', 'info', 'warning', 'danger', 'secondary']),
};

Badge.defaultProps = {
  type: 'primary',
};

export default Badge; 