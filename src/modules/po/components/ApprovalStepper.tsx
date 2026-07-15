import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { Approval } from '../../../types/approval';
import type { User } from '../../../types/user';
import { getActionableApproval, getRejection, sortBySteps } from '../approvalChain';
import { StatusPill } from '../../../components/StatusPill';

interface ApprovalStepperProps {
  approvals: Approval[];
  users: User[];
}

const ROLE_LABELS: Record<string, string> = {
  requester: 'Requester',
  approver: 'Approver',
  finance: 'Finance',
};

export function ApprovalStepper({ approvals, users }: ApprovalStepperProps) {
  const theme = useTheme();
  const steps = sortBySteps(approvals);
  const actionable = getActionableApproval(steps);
  const rejection = getRejection(steps);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
        }}
      >
        {steps.map((approval, index) => {
          const approver = users.find((u) => u.id === approval.approverId);
          const isCurrent = actionable?.id === approval.id;
          const isLast = index === steps.length - 1;

          const circleColor =
            approval.status === 'approved'
              ? theme.palette.status.approved.fg
              : approval.status === 'rejected'
                ? theme.palette.status.rejected.fg
                : isCurrent
                  ? theme.palette.primary.main
                  : theme.palette.divider;

          const circleBg =
            approval.status === 'approved'
              ? theme.palette.status.approved.fg
              : approval.status === 'rejected'
                ? theme.palette.status.rejected.fg
                : 'transparent';

          const circleTextColor =
            approval.status === 'approved' || approval.status === 'rejected'
              ? theme.palette.status.approved.bg
              : isCurrent
                ? theme.palette.primary.main
                : theme.palette.text.secondary;

          return (
            <Box
              key={approval.id}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'column' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1.5, sm: 0 },
                flex: { sm: 1 },
                width: { xs: '100%', sm: 'auto' },
                position: 'relative',
              }}
            >
              {/* Connector to previous step (desktop: line to the left; mobile: line above) */}
              {index > 0 && (
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    position: 'absolute',
                    top: 17,
                    right: '50%',
                    width: '100%',
                    height: 2,
                    backgroundColor:
                      steps[index - 1].status === 'approved' ? theme.palette.status.approved.fg : theme.palette.divider,
                    zIndex: 0,
                  }}
                />
              )}

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: { sm: 44 },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${circleColor}`,
                    backgroundColor: circleBg,
                    color: circleTextColor,
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {approval.status === 'approved' ? (
                    <CheckIcon fontSize="small" />
                  ) : approval.status === 'rejected' ? (
                    <CloseIcon fontSize="small" />
                  ) : (
                    approval.stepNumber
                  )}
                </Box>
                {!isLast && (
                  <Box
                    sx={{
                      display: { xs: 'block', sm: 'none' },
                      width: 2,
                      height: 28,
                      ml: '17px',
                      backgroundColor:
                        approval.status === 'approved' ? theme.palette.status.approved.fg : theme.palette.divider,
                    }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  textAlign: { xs: 'left', sm: 'center' },
                  pb: { xs: 2, sm: 0 },
                  mt: { sm: 1 },
                  px: { sm: 1 },
                }}
              >
                <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{approver?.name ?? approval.approverId}</Typography>
                <Typography sx={{ fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary' }}>
                  {approver ? ROLE_LABELS[approver.role] : ''}
                </Typography>
                <Box sx={{ mt: 0.75, display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                  <StatusPill status={approval.status} />
                </Box>
                {approval.decidedDate && (
                  <Typography sx={{ mt: 0.5, fontSize: 11.5, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                    {approval.decidedDate}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {rejection && (
        <Paper
          sx={{
            mt: 3,
            p: 2.5,
            backgroundColor: theme.palette.status.rejected.bg,
            borderColor: theme.palette.status.rejected.fg,
          }}
        >
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: theme.palette.status.rejected.fg }}>
            Rejected by {users.find((u) => u.id === rejection.approverId)?.name ?? rejection.approverId}
            {rejection.decidedDate ? ` on ${rejection.decidedDate}` : ''}
          </Typography>
          {rejection.comments && (
            <Typography sx={{ mt: 0.75, fontSize: 13.5, color: theme.palette.text.primary }}>
              "{rejection.comments}"
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}
