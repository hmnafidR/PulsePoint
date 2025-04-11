/**
 * This module handles topic extraction from meeting transcripts
 * In a real implementation, it would use NLP models for topic extraction
 * 
 * For this implementation, we'll simulate these capabilities.
 */

export interface Topic {
  id: string;
  name: string;
  keywords: string[];
  frequency: number; // How many times the topic appears in the meeting
  segments: number[]; // Segment indices where this topic appears
  description?: string;
  percentage?: number; // What percentage of the meeting was spent on this topic
}

export interface TopicExtractionResult {
  topics: Topic[];
  keywordFrequency: Record<string, number>;
  dominantTopics: Topic[];
}

/**
 * Extract topics from text segments in a meeting transcript
 * In a real implementation, this would use a pre-trained NLP model
 */
export function extractTopics(
  segments: Array<{ text: string; start: number; end: number; id?: number | string }>
): TopicExtractionResult {
  // This is a simulated implementation
  // A real implementation would use techniques like:
  // - TF-IDF to identify important keywords
  // - LDA (Latent Dirichlet Allocation) for topic modeling
  // - BERT or similar for more advanced extraction
  
  // Predefined topic areas that we'll simulate finding
  const potentialTopics = [
    {
      name: 'Project Updates',
      keywords: ['project', 'update', 'status', 'timeline', 'milestone', 'progress', 'deliverable']
    },
    {
      name: 'Technical Discussion',
      keywords: ['technical', 'code', 'api', 'implementation', 'architecture', 'system', 'design', 'solution']
    },
    {
      name: 'Product Development',
      keywords: ['product', 'feature', 'design', 'user', 'customer', 'requirement', 'specification']
    },
    {
      name: 'Team Collaboration',
      keywords: ['team', 'collaborate', 'coordination', 'communication', 'responsibility', 'role']
    },
    {
      name: 'Performance Review',
      keywords: ['performance', 'metric', 'kpi', 'goal', 'objective', 'measure', 'improvement']
    },
    {
      name: 'Budget Discussion',
      keywords: ['budget', 'cost', 'expense', 'financial', 'funding', 'resource', 'allocation']
    },
    {
      name: 'Customer Feedback',
      keywords: ['customer', 'user', 'feedback', 'review', 'satisfaction', 'complaint', 'suggestion']
    },
    {
      name: 'Action Items',
      keywords: ['action', 'task', 'follow', 'assign', 'responsibility', 'deadline', 'complete']
    }
  ];
  
  // Combined text for keyword extraction
  const allText = segments.map(segment => segment.text.toLowerCase()).join(' ');
  
  // Count all words for frequency analysis
  const words = allText.split(/\s+/).map(word => word.replace(/[^\w]/g, ''));
  const wordFrequency: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 2) { // Skip very short words
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  // Find which topics appear in each segment
  const topicMatches: Record<string, { count: number, segments: number[] }> = {};
  
  segments.forEach((segment, index) => {
    const segmentText = segment.text.toLowerCase();
    
    potentialTopics.forEach(topic => {
      let found = false;
      
      topic.keywords.forEach(keyword => {
        if (segmentText.includes(keyword)) {
          found = true;
          // Once we find a keyword, we consider the topic present in this segment
          if (!topicMatches[topic.name]) {
            topicMatches[topic.name] = { count: 0, segments: [] };
          }
          
          if (!topicMatches[topic.name].segments.includes(index)) {
            topicMatches[topic.name].segments.push(index);
            topicMatches[topic.name].count++;
          }
        }
      });
    });
  });
  
  // Generate topic results
  const topics: Topic[] = Object.entries(topicMatches).map(([name, data]) => {
    const matchingPotentialTopic = potentialTopics.find(t => t.name === name);
    const keywords = matchingPotentialTopic?.keywords || [];
    
    return {
      id: `topic_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name,
      keywords: keywords.filter(k => allText.includes(k)), // Only include keywords that actually appear
      frequency: data.count,
      segments: data.segments,
      percentage: (data.segments.length / segments.length) * 100
    };
  });
  
  // Sort topics by frequency
  topics.sort((a, b) => b.frequency - a.frequency);
  
  // Select dominant topics (top 3 or fewer if less available)
  const dominantTopics = topics.slice(0, Math.min(3, topics.length));
  
  // Find top keywords by frequency
  const keywordFrequency: Record<string, number> = {};
  topics.forEach(topic => {
    topic.keywords.forEach(keyword => {
      const count = (allText.match(new RegExp(`\\b${keyword}\\b`, 'gi')) || []).length;
      keywordFrequency[keyword] = count;
    });
  });
  
  return {
    topics,
    keywordFrequency,
    dominantTopics
  };
}

/**
 * Extract key phrases from a transcript
 * This would identify important phrases or summaries
 */
export function extractKeyPhrases(text: string, count: number = 5): string[] {
  // In a real implementation, this would use techniques like:
  // - TextRank algorithm
  // - BERT-based extractive summarization
  // - GPT-based abstractive summarization
  
  // For this simulation, we'll extract sentences with topic keywords
  
  // Split into sentences
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
  
  // Get combined topic keywords from our potential topics
  const allKeywords: string[] = [];
  potentialTopics.forEach(topic => {
    allKeywords.push(...topic.keywords);
  });
  
  // Score sentences based on keyword presence
  const scoredSentences = sentences.map(sentence => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;
    
    allKeywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) {
        score++;
      }
    });
    
    return { sentence: sentence.trim(), score };
  });
  
  // Sort by score and take the top ones
  scoredSentences.sort((a, b) => b.score - a.score);
  
  return scoredSentences
    .slice(0, Math.min(count, scoredSentences.length))
    .map(s => s.sentence);
}

// Make the potentialTopics available for the simulation
const potentialTopics = [
  {
    name: 'Project Updates',
    keywords: ['project', 'update', 'status', 'timeline', 'milestone', 'progress', 'deliverable']
  },
  {
    name: 'Technical Discussion',
    keywords: ['technical', 'code', 'api', 'implementation', 'architecture', 'system', 'design', 'solution']
  },
  {
    name: 'Product Development',
    keywords: ['product', 'feature', 'design', 'user', 'customer', 'requirement', 'specification']
  },
  {
    name: 'Team Collaboration',
    keywords: ['team', 'collaborate', 'coordination', 'communication', 'responsibility', 'role']
  },
  {
    name: 'Performance Review',
    keywords: ['performance', 'metric', 'kpi', 'goal', 'objective', 'measure', 'improvement']
  },
  {
    name: 'Budget Discussion',
    keywords: ['budget', 'cost', 'expense', 'financial', 'funding', 'resource', 'allocation']
  },
  {
    name: 'Customer Feedback',
    keywords: ['customer', 'user', 'feedback', 'review', 'satisfaction', 'complaint', 'suggestion']
  },
  {
    name: 'Action Items',
    keywords: ['action', 'task', 'follow', 'assign', 'responsibility', 'deadline', 'complete']
  }
]; 