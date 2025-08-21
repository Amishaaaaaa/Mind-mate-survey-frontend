import { useLocation, useParams } from 'react-router-dom';
import { useState } from 'react';
import Header from './Header';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const SelfAssess = ({ isLoggedIn, onLogout }) => {
  const { subject } = useParams();
  const location = useLocation();
  const username = localStorage.getItem('username');

  const levelToTitle = location.state?.levelToTitle || {};
  const titleToLevel = Object.fromEntries(
    Object.entries(levelToTitle).map(([level, title]) => [title, level])
  );
  const titles = Object.values(levelToTitle);

  const [order, setOrder] = useState(['', '', '']);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (index, value) => {
    const updated = [...order];
    updated[index] = value;
    setOrder(updated);
  };

  const isDuplicate = new Set(order).size !== order.length;
  const passages = location.state?.passages || [];

  const handleSubmit = async () => {
    const selectedLevels = order.map((title) => titleToLevel[title]);
    const payload = {
      username,
      content_type: subject.charAt(0).toUpperCase() + subject.slice(1),
      preference: `${selectedLevels.join(',')}`
    };

    try {
      const res = await fetch('http://localhost:8000/save-content-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to save preference');
      }
    } catch (err) {
      alert('Error while saving preference');
    }
  };

  const levelKeys = ['low', 'medium', 'high'];
  const levelToPassage = {};
  levelKeys.forEach((lvl, idx) => {
    levelToPassage[lvl] = passages[idx];
  });


  return (
    <div>
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        bgcolor: '#f9f9f9',
        py: 10,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1200,
          bgcolor: 'background.paper',
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        {submitted ? (
          <>
            <Typography variant="h5" gutterBottom>
              Thank you for taking part in the survey!
            </Typography>
            <Typography variant="body1">
              Your preferences have been saved successfully.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              Self Assessment - {subject.charAt(0).toUpperCase() + subject.slice(1)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Choose the passages in the order of your preference.
            </Typography>

            {['Most Convenient', 'Moderately Convenient', 'Least Convenient'].map((label, index) => (
              <FormControl fullWidth sx={{ mt: 2 }} variant="outlined">
              <InputLabel id={`select-label-${index}`}>{label}</InputLabel>
              <Select
                labelId={`select-label-${index}`}
                id={`select-${index}`}
                value={order[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                label={label}
              >
                {titles.map((title) => (
                  <MenuItem key={title} value={title}>
                    {title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            
            ))}
            {isDuplicate && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Please select different options for each preference.
              </Typography>
            )}

            <Button
              variant="contained"
              sx={{ mt: 4 }}
              disabled={order.includes('') || isDuplicate}
              onClick={handleSubmit}
            >
              Submit Preference
            </Button>
            <Box sx={{ mt: 6 }}>
              <Typography variant="h6" gutterBottom>
                Review the Passages
              </Typography>
              <Box
    sx={{
      display: 'flex',
      gap: 2,
      // flexWrap: 'wrap',
      justifyContent: 'space-between',
      mt: 2,
      flexWrap: 'nowrap',
      overflowX: 'auto'
    }}
  >
    {levelKeys.map((level) => {
      const rawContent = levelToPassage[level];
      if (!rawContent) return null;
      const match = rawContent.match(/^##\s*(.+?)\s*\n/);
      const title = match ? match[1] : levelToTitle[level] || 'Untitled';
      const body = match ? rawContent.slice(match[0].length) : rawContent;

      return (
        <Box
          key={level}
          sx={{
            flex: '1 1 30%',
            minWidth: 250,
            bgcolor: '#f0f0f0',
            borderRadius: 2,
            p: 2,
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {title}
          </Typography>
          <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <Typography variant="body2" paragraph {...props} />,
              strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} />,
              em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
            }}
          >
            {body}
          </ReactMarkdown>
        </Box>
      );
    })}
  </Box>
</Box>


          </>
        )}
      </Box>
    </Box>
    </div>
  );
};

export default SelfAssess;
