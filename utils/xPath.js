export function generalizeXPaths(xpaths) {
    if (xpaths.length === 0) return '';
  
    // Split each XPath into its segments
    const splitXPaths = xpaths.map(xpath => xpath.split('/'));
  
    // Determine the length of the shortest XPath
    const minLength = Math.min(...splitXPaths.map(parts => parts.length));
  
    // Initialize an array to hold the generalized segments
    const generalizedSegments = [];
  
    // Iterate over each segment index
    for (let i = 0; i < minLength; i++) {
      // Extract the current segment from each XPath
      const segments = splitXPaths.map(parts => parts[i]);
  
      // Check if all segments are identical
      const allIdentical = segments.every(segment => segment === segments[0]);
  
      if (allIdentical) {
        // If all segments are identical, add the segment to the generalized list
        generalizedSegments.push(segments[0]);
      } else {
        // If segments differ, check for numeric patterns
        const matches = segments.map(segment => segment.match(/^(.*)\[(\d+)\]$/));
  
        // Ensure all segments match the pattern and have consistent prefixes
        const allMatchPattern = matches.every(match => match !== null && match[1] === matches[0][1]);
  
        if (allMatchPattern) {
          // Replace the numeric index with an iterator variable
          const iteratorVariable = 'i';
          generalizedSegments.push(`${matches[0][1]}[${iteratorVariable}]`);
        } else {
          // If segments don't match the pattern, retain the original segment
          generalizedSegments.push(segments[0]);
        }
      }
    }
  
    // Join the generalized segments to form the generalized XPath
    return generalizedSegments.join('/');
  }