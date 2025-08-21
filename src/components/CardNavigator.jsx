import { Button, Box, LinearProgress, Typography } from '@mui/material';

export default function CardNavigator({ currentIndex, total, onPrevious, onNext }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="outlined"
          disabled={currentIndex === 0}
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          disabled={currentIndex === total - 1}
          onClick={onNext}
        >
          Next
        </Button>
      </Box>
      <LinearProgress
        variant="determinate"
        value={((currentIndex + 1) / total) * 100}
        sx={{ height: 10, borderRadius: 5 }}
      />
      <Typography variant="caption" display="block" align="center" mt={1}>
        Step {currentIndex + 1} of {total}
      </Typography>
    </Box>
  );
}
