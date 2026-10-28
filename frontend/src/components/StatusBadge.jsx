import React from 'react';
import { CheckCircle2, XCircle, Clock, Award, FileText } from 'lucide-react';

const StatusBadge = ({ type, text }) => {
  let badgeClass = 'badge-applied';
  let Icon = Clock;

  switch (type) {
    case 'eligible':
      badgeClass = 'badge-eligible';
      Icon = CheckCircle2;
      break;
    case 'ineligible':
      badgeClass = 'badge-ineligible';
      Icon = XCircle;
      break;
    case 'APPLIED':
      badgeClass = 'badge-applied';
      Icon = FileText;
      break;
    case 'SHORTLISTED':
    case 'ASSESSMENT_SCHEDULED':
    case 'INTERVIEW_SCHEDULED':
      badgeClass = 'badge-shortlisted';
      Icon = Clock;
      break;
    case 'OFFERED':
    case 'ACCEPTED':
      badgeClass = 'badge-offered';
      Icon = Award;
      break;
    case 'REJECTED':
    case 'DECLINED':
      badgeClass = 'badge-ineligible';
      Icon = XCircle;
      break;
    default:
      break;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <Icon size={13} /> {text || type}
    </span>
  );
};

export default StatusBadge;
