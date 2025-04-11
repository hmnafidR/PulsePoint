import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
  Link
} from '@react-pdf/renderer';

// Define types directly instead of importing them
interface SentimentTimelineItem {
  timestamp: number | string;
  sentiment: number;
}

interface SpeakerAnalysisDataItem {
  name: string;
  speakingTime: number;
  sentiment: number;
}

interface TopicAnalysisDataItem {
  name: string;
  percentage: number;
  sentiment?: "positive" | "neutral" | "negative";
  keywords?: string[];
}

// Remove font registration to use default fonts only
// This avoids potential font loading errors

// Define types for our PDF props
interface MeetingPDFProps {
  meetingId: string;
  meetingTitle: string;
  recordedOn?: string;
  summary?: string;
  sentimentOverall?: number;
  engagementScore?: number;
  currentSpeaker?: string;
  speakerSentiment?: number;
  meetingDuration?: string;
  sentimentTimeline?: SentimentTimelineItem[];
  speakerAnalysis?: SpeakerAnalysisDataItem[];
  topicAnalysis?: TopicAnalysisDataItem[];
  participantStats: {
    total: number;
    active: number;
    speaking: number;
    reacting: number;
  };
  actionItems?: string[];
  reactions?: {
    name: string;
    count: number;
  }[];
  insights?: string;
}

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica', // Use built-in Helvetica
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#111827',
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 15,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    color: '#111827',
    fontFamily: 'Helvetica-Bold',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
    fontFamily: 'Helvetica',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  metricCardBlue: {
    backgroundColor: '#3B82F6',
  },
  metricCardCyan: {
    backgroundColor: '#06B6D4',
  },
  metricCardIndigo: {
    backgroundColor: '#6366F1',
  },
  metricCardTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  metricCardValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  metricCardDescription: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 3,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10,
    color: '#374151',
  },
  chartContainer: {
    height: 150,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9FAFB',
  },
  topicsTable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    fontWeight: 700,
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    color: '#374151',
  },
  tableCellTopic: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  tableCellPercentage: {
    width: '15%',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    textAlign: 'center',
  },
  tableCellKeywords: {
    width: '45%',
  },
  speakersTable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 10,
  },
  speakerTableCellName: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  speakerTableCellTime: {
    width: '25%',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    textAlign: 'center',
  },
  speakerTableCellSentiment: {
    width: '25%',
    textAlign: 'center',
  },
  participationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    flexWrap: 'wrap',
  },
  participationCard: {
    width: '22%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  participationValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
    textAlign: 'center',
  },
  participationLabel: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 5,
  },
  actionItem: {
    fontSize: 12,
    marginVertical: 3,
    color: '#374151',
  },
  reactionsTable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 10,
  },
  reactionTableCellName: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  reactionTableCellCount: {
    width: '50%',
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 5,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },
  participationMetrics: {
    marginTop: 15,
  },
  participationMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  participationMetricLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  participationMetricValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
  },
  participationMetricDescription: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#9CA3AF',
  },
});

// Simple Progress Bar component
const ProgressBar = ({ value }: { value: number }) => (
  <View style={styles.progressBar}>
    <View style={[styles.progressBarFill, { width: `${value}%` }]} />
  </View>
);

// Method to convert sentiment timeline data to SVG path
const createSentimentTimelinePath = (data: SentimentTimelineItem[]) => {
  if (!data || data.length < 2) return '';
  
  // Find min and max timestamps to normalize x-axis
  const timestamps = data.map(d => typeof d.timestamp === 'string' ? parseFloat(d.timestamp) : d.timestamp);
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const timeRange = maxTime - minTime;
  
  const width = 400;
  const height = 100;
  const padding = 20;
  
  // Create SVG path
  let path = '';
  data.forEach((point, i) => {
    const x = padding + ((typeof point.timestamp === 'string' ? parseFloat(point.timestamp) : point.timestamp) - minTime) / timeRange * (width - 2 * padding);
    // Sentiment is assumed to be 0-1, scale to the chart height (inverted, as SVG y-axis goes top to bottom)
    const y = height - padding - (point.sentiment * (height - 2 * padding));
    
    if (i === 0) {
      path += `M${x},${y}`;
    } else {
      path += ` L${x},${y}`;
    }
  });
  
  return path;
};

// Main PDF Component
const MeetingPDF: React.FC<MeetingPDFProps> = ({
  meetingTitle,
  recordedOn,
  summary,
  sentimentOverall = 0,
  engagementScore = 0,
  currentSpeaker = 'None',
  speakerSentiment = 0,
  meetingDuration = '00:00:00',
  sentimentTimeline = [],
  speakerAnalysis = [],
  topicAnalysis = [],
  participantStats,
  actionItems = [],
  reactions = [],
  insights
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 1. Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Meeting Analysis: {meetingTitle}</Text>
        
        {/* 2. Date */}
        {recordedOn && <Text style={styles.subtitle}>Recorded on {recordedOn}</Text>}
      </View>
      
      {/* 3. Current Meeting metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Meeting Metrics</Text>
        <View style={styles.metricsContainer}>
          {/* Overall Sentiment */}
          <View style={[styles.metricCard, styles.metricCardBlue]}>
            <Text style={styles.metricCardTitle}>Overall Sentiment</Text>
            <Text style={styles.metricCardValue}>{sentimentOverall}%</Text>
            <Text style={styles.metricCardDescription}>Sentiment score from analysis</Text>
          </View>
          
          {/* Average Engagement */}
          <View style={[styles.metricCard, styles.metricCardCyan]}>
            <Text style={styles.metricCardTitle}>Average Engagement</Text>
            <Text style={styles.metricCardValue}>{engagementScore}%</Text>
            <Text style={styles.metricCardDescription}>Overall participant engagement</Text>
          </View>
          
          {/* Current Speaker */}
          <View style={[styles.metricCard, styles.metricCardIndigo]}>
            <Text style={styles.metricCardTitle}>Current Speaker</Text>
            <Text style={styles.metricCardValue}>{currentSpeaker}</Text>
            <Text style={styles.metricCardDescription}>Sentiment: {speakerSentiment}%</Text>
          </View>
          
          {/* Meeting Duration */}
          <View style={[styles.metricCard, styles.metricCardBlue]}>
            <Text style={styles.metricCardTitle}>Meeting Duration</Text>
            <Text style={styles.metricCardValue}>{meetingDuration}</Text>
            <Text style={styles.metricCardDescription}>Total meeting time</Text>
          </View>
        </View>
      </View>
      
      {/* 4. Meeting Sentiment Overview */}
      {sentimentTimeline && sentimentTimeline.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting Sentiment Overview</Text>
          <Text style={styles.sectionSubtitle}>Sentiment trend over time.</Text>
          
          <View style={[styles.chartContainer, { backgroundColor: '#f0fdf4' }]}>
            {/* Grid background for chart */}
            <View style={{
              height: 150,
              position: 'relative',
              paddingLeft: 30,
              paddingBottom: 20,
              paddingRight: 10,
              paddingTop: 10,
              borderColor: '#E5E7EB',
            }}>
              {/* Background grid lines */}
              <View style={{position: 'absolute', left: 30, right: 10, top: 20, height: 1, backgroundColor: '#E5E7EB'}} />
              <View style={{position: 'absolute', left: 30, right: 10, top: 50, height: 1, backgroundColor: '#E5E7EB'}} />
              <View style={{position: 'absolute', left: 30, right: 10, top: 80, height: 1, backgroundColor: '#E5E7EB'}} />
              <View style={{position: 'absolute', left: 30, right: 10, top: 110, height: 1, backgroundColor: '#E5E7EB'}} />
              
              {/* Vertical grid lines */}
              <View style={{position: 'absolute', left: 30, width: 1, top: 10, bottom: 20, backgroundColor: '#E5E7EB'}} />
              <View style={{position: 'absolute', left: 87, width: 1, top: 10, bottom: 20, backgroundColor: '#E5E7EB'}} />
              <View style={{position: 'absolute', left: 144, width: 1, top: 10, bottom: 20, backgroundColor: '#E5E7EB'}} />
              <View style={{position: 'absolute', left: 201, width: 1, top: 10, bottom: 20, backgroundColor: '#E5E7EB'}} />
              <View style={{position: 'absolute', left: 258, width: 1, top: 10, bottom: 20, backgroundColor: '#E5E7EB'}} />
              <View style={{position: 'absolute', left: 315, width: 1, top: 10, bottom: 20, backgroundColor: '#E5E7EB'}} />
              
              {/* Y-axis labels */}
              <Text style={{position: 'absolute', left: 0, top: 15, fontSize: 8, color: '#9CA3AF'}}>100%</Text>
              <Text style={{position: 'absolute', left: 0, top: 45, fontSize: 8, color: '#9CA3AF'}}>75%</Text>
              <Text style={{position: 'absolute', left: 0, top: 75, fontSize: 8, color: '#9CA3AF'}}>50%</Text>
              <Text style={{position: 'absolute', left: 0, top: 105, fontSize: 8, color: '#9CA3AF'}}>25%</Text>
              <Text style={{position: 'absolute', left: 0, top: 135, fontSize: 8, color: '#9CA3AF'}}>0%</Text>
              
              {/* X-axis labels */}
              <Text style={{position: 'absolute', left: 25, bottom: 5, fontSize: 8, color: '#9CA3AF'}}>0 min</Text>
              <Text style={{position: 'absolute', left: 82, bottom: 5, fontSize: 8, color: '#9CA3AF'}}>15 min</Text>
              <Text style={{position: 'absolute', left: 139, bottom: 5, fontSize: 8, color: '#9CA3AF'}}>30 min</Text>
              <Text style={{position: 'absolute', left: 196, bottom: 5, fontSize: 8, color: '#9CA3AF'}}>45 min</Text>
              <Text style={{position: 'absolute', left: 253, bottom: 5, fontSize: 8, color: '#9CA3AF'}}>60 min</Text>
              <Text style={{position: 'absolute', left: 310, bottom: 5, fontSize: 8, color: '#9CA3AF'}}>75 min</Text>
              
              {/* Sentiment line (green) */}
              <View style={{position: 'absolute', left: 30, top: 65, width: 57, height: 2, backgroundColor: '#22c55e'}} />
              <View style={{position: 'absolute', left: 87, top: 62, width: 57, height: 2, backgroundColor: '#22c55e'}} />
              <View style={{position: 'absolute', left: 144, top: 70, width: 57, height: 2, backgroundColor: '#22c55e'}} />
              <View style={{position: 'absolute', left: 201, top: 65, width: 57, height: 2, backgroundColor: '#22c55e'}} />
              <View style={{position: 'absolute', left: 258, top: 62, width: 57, height: 2, backgroundColor: '#22c55e'}} />
              
              {/* Engagement line (blue) */}
              <View style={{position: 'absolute', left: 30, top: 90, width: 57, height: 2, backgroundColor: '#2563eb'}} />
              <View style={{position: 'absolute', left: 87, top: 87, width: 57, height: 2, backgroundColor: '#2563eb'}} />
              <View style={{position: 'absolute', left: 144, top: 95, width: 57, height: 2, backgroundColor: '#2563eb'}} />
              <View style={{position: 'absolute', left: 201, top: 87, width: 57, height: 2, backgroundColor: '#2563eb'}} />
              <View style={{position: 'absolute', left: 258, top: 85, width: 57, height: 2, backgroundColor: '#2563eb'}} />
              
              {/* Sentiment data points */}
              <View style={{position: 'absolute', left: 27, top: 62, width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e'}} />
              <View style={{position: 'absolute', left: 84, top: 59, width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e'}} />
              <View style={{position: 'absolute', left: 141, top: 67, width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e'}} />
              <View style={{position: 'absolute', left: 198, top: 62, width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e'}} />
              <View style={{position: 'absolute', left: 255, top: 59, width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e'}} />
              <View style={{position: 'absolute', left: 312, top: 62, width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e'}} />
              
              {/* Engagement data points */}
              <View style={{position: 'absolute', left: 27, top: 87, width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb'}} />
              <View style={{position: 'absolute', left: 84, top: 84, width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb'}} />
              <View style={{position: 'absolute', left: 141, top: 92, width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb'}} />
              <View style={{position: 'absolute', left: 198, top: 84, width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb'}} />
              <View style={{position: 'absolute', left: 255, top: 82, width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb'}} />
              <View style={{position: 'absolute', left: 312, top: 87, width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb'}} />
            </View>
            
            {/* Legend */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 10,
              marginBottom: 5
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 4 }} />
                <Text style={{ fontSize: 8, color: '#4B5563' }}>Sentiment</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb', marginRight: 4 }} />
                <Text style={{ fontSize: 8, color: '#4B5563' }}>Engagement</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* 5. Meeting Participation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meeting Participation</Text>
        <Text style={styles.sectionSubtitle}>Participation breakdown.</Text>
        
        <View style={styles.participationContainer}>
          <View style={styles.participationCard}>
            <Text style={styles.participationValue}>{participantStats.total}</Text>
            <Text style={styles.participationLabel}>Total Participants</Text>
          </View>
          <View style={styles.participationCard}>
            <Text style={styles.participationValue}>{participantStats.active}</Text>
            <Text style={styles.participationLabel}>Active Participants</Text>
          </View>
          <View style={styles.participationCard}>
            <Text style={styles.participationValue}>{participantStats.reacting}</Text>
            <Text style={styles.participationLabel}>Reacting Participants</Text>
          </View>
          <View style={styles.participationCard}>
            <Text style={styles.participationValue}>{participantStats.speaking}</Text>
            <Text style={styles.participationLabel}>Speaking Participants</Text>
          </View>
        </View>
        
        {/* Participation Metrics */}
        <View style={styles.participationMetrics}>
          <View style={styles.participationMetricRow}>
            <Text style={styles.participationMetricLabel}>Overall Participation</Text>
            <Text style={styles.participationMetricValue}>
              {participantStats.total > 0 ? Math.round((participantStats.active / participantStats.total) * 100) : 0}%
            </Text>
          </View>
          <ProgressBar value={participantStats.total > 0 ? (participantStats.active / participantStats.total) * 100 : 0} />
          <Text style={styles.participationMetricDescription}>
            {participantStats.active} out of {participantStats.total} participants engaged in the meeting
          </Text>
          
          <View style={[styles.participationMetricRow, { marginTop: 15 }]}>
            <Text style={styles.participationMetricLabel}>Speaking Participation</Text>
            <Text style={styles.participationMetricValue}>
              {participantStats.total > 0 ? Math.round((participantStats.speaking / participantStats.total) * 100) : 0}%
            </Text>
          </View>
          <ProgressBar value={participantStats.total > 0 ? (participantStats.speaking / participantStats.total) * 100 : 0} />
          <Text style={styles.participationMetricDescription}>
            {participantStats.speaking} participants spoke during the meeting
          </Text>
        </View>
      </View>
      
      {/* 6. AI-Powered Topic Analysis */}
      {(insights || summary) && (
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>AI-Powered Topic Analysis</Text>
          
          {/* Place summary above insights */}
          {summary && (
            <View style={{marginTop: 10, marginBottom: 15}}>
              <Text style={[styles.sectionSubtitle, {fontWeight: 'bold'}]}>Meeting Summary</Text>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          )}
          
          {/* Display insights text */}
          {insights && (
            <View style={{marginTop: 10}}>
              <Text style={[styles.sectionSubtitle, {fontWeight: 'bold'}]}>Topic Analysis</Text>
              <Text style={styles.summaryText}>{insights}</Text>
            </View>
          )}
        </View>
      )}
      
      {/* 7. Speaker Analysis */}
      {speakerAnalysis && speakerAnalysis.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Speaker Analysis</Text>
          <View style={styles.speakersTable}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.speakerTableCellName]}>Speaker</Text>
              <Text style={[styles.tableCell, styles.speakerTableCellTime]}>Speaking Time</Text>
              <Text style={[styles.tableCell, styles.speakerTableCellSentiment]}>Sentiment</Text>
            </View>
            
            {speakerAnalysis.map((speaker, index) => {
              // Format speaking time to MM:SS
              const minutes = Math.floor(speaker.speakingTime / 60);
              const seconds = Math.floor(speaker.speakingTime % 60);
              const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              
              // Format sentiment as percentage
              const sentimentFormatted = `${Math.round(speaker.sentiment * 100)}%`;
              
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.speakerTableCellName]}>{speaker.name}</Text>
                  <Text style={[styles.tableCell, styles.speakerTableCellTime]}>{timeFormatted}</Text>
                  <Text style={[styles.tableCell, styles.speakerTableCellSentiment]}>{sentimentFormatted}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
      
      {/* 8. Meeting Reactions Analysis */}
      {reactions && reactions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meeting Reactions Analysis</Text>
          <View style={styles.reactionsTable}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.reactionTableCellName]}>Reaction</Text>
              <Text style={[styles.tableCell, styles.reactionTableCellCount]}>Count</Text>
            </View>
            
            {reactions.map((reaction, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.reactionTableCellName]}>
                  {/* Try to display the emoji and the reaction name */}
                  {reaction.name}
                </Text>
                <Text style={[styles.tableCell, styles.reactionTableCellCount]}>{reaction.count}</Text>
              </View>
            ))}
          </View>
          
          {/* Add a small note about emoji display limitations */}
          <Text style={{ fontSize: 8, color: '#6B7280', textAlign: 'center', marginTop: 5 }}>
            See interactive dashboard for full emoji visualization
          </Text>
        </View>
      )}
      
      {/* Action Items - Optional, can be shown if action items exist */}
      {actionItems && actionItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action Items</Text>
          {actionItems.map((item, index) => (
            <Text key={index} style={styles.actionItem}>• {item}</Text>
          ))}
        </View>
      )}
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text>Generated with PulsePoint Analytics • {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);

export default MeetingPDF; 