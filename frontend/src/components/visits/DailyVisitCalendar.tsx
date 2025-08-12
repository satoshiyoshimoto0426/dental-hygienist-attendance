import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ja';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    Refresh as RefreshIcon
  } from '@mui/icons-material';
import { 
  DailyVisitRecord, 
  CalendarEvent,
  CreateDailyVisitRecordInput,
  UpdateDailyVisitRecordInput,
  DailyVisitStatus
} from '../../types/DailyVisitRecord';
import { Patient } from '../../types/Patient';
import { Hygienist } from '../../types/Hygienist';
import { DailyVisitRecordForm } from './DailyVisitRecordForm';
import { DailyVisitRecordDetailDialog } from './DailyVisitRecordDetailDialog';
import { DailyVisitRecordStatusManager } from './DailyVisitRecordStatusManager';
import { DailyVisitRecordService } from '../../services/dailyVisitRecordService';
import { PatientService } from '../../services/patientService';
import { HygienistService } from '../../services/hygienistService';

// moment.jsの日本語設定
moment.locale('ja');
const localizer = momentLocalizer(moment);

// カレンダーの日本語メッセージ
const messages = {
  allDay: '終日',
  previous: '前',
  next: '次',
  today: '今日',
  month: '月',
  week: '週',
  day: '日',
  agenda: 'アジェンダ',
  date: '日付',
  time: '時間',
  event: 'イベント',
  noEventsInRange: 'この期間にイベントはありません',
  showMore: (total: number) => `他 ${total} 件`
};

interface DailyVisitCalendarProps {
  className?: string;
}

export const DailyVisitCalendar: React.FC<DailyVisitCalendarProps> = ({ className }) => {
  const [records, setRecords] = useState<DailyVisitRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hygienists, setHygienists] = useState<Hygienist[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('month');
  
  // フォーム関連の状態
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DailyVisitRecord | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [formLoading, setFormLoading] = useState(false);
  
  // 詳細ダイアログ関連の状態
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<DailyVisitRecord | null>(null);
  
  // ステータス管理関連の状態
  const [statusManagerOpen, setStatusManagerOpen] = useState(false);
  const [statusRecord, setStatusRecord] = useState<DailyVisitRecord | null>(null);

  // データ読み込み
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const [recordsData, patientsData, hygienistsData] = await Promise.all([
        DailyVisitRecordService.getDailyVisitRecords({ year, month }),
        PatientService.getPatients(),
        HygienistService.getHygienists()
      ]);
      
      setRecords(recordsData);
      setPatients(patientsData);
      setHygienists(hygienistsData);
    } catch (err) {
      console.error('データ読み込みエラー:', err);
      setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  // 初期データ読み込み
  useEffect(() => {
    loadData();
  }, [loadData]);

  // レコードをカレンダーイベントに変換
  useEffect(() => {
    const calendarEvents: CalendarEvent[] = records.map(record => {
      const visitDate = new Date(record.visitDate);
      const startTime = record.startTime ? record.startTime.split(':') : ['09', '00'];
      const endTime = record.endTime ? record.endTime.split(':') : ['10', '00'];
      
      const start = new Date(visitDate);
      start.setHours(parseInt(startTime[0]), parseInt(startTime[1]), 0, 0);
      
      const end = new Date(visitDate);
      end.setHours(parseInt(endTime[0]), parseInt(endTime[1]), 0, 0);
      
      const patientName = record.patient?.name || '不明な患者';
      const hygienistName = record.hygienist?.name || '不明な歯科衛生士';
      
      return {
        id: record.id,
        title: `${patientName} - ${hygienistName}`,
        start,
        end,
        resource: record
      };
    });
    
    setEvents(calendarEvents);
  }, [records]);

  // 日付クリック時の処理
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedRecord(undefined);
    setSelectedDate(start);
    setFormOpen(true);
  };

  // イベントクリック時の処理（詳細表示）
  const handleSelectEvent = (event: CalendarEvent) => {
    setDetailRecord(event.resource);
    setDetailOpen(true);
  };

  // 詳細ダイアログから編集モードへ
  const handleEditFromDetail = (record: DailyVisitRecord) => {
    setSelectedRecord(record);
    setSelectedDate(undefined);
    setDetailOpen(false);
    setFormOpen(true);
  };

  // フォーム送信処理
  const handleFormSubmit = async (data: CreateDailyVisitRecordInput | UpdateDailyVisitRecordInput) => {
    setFormLoading(true);
    
    try {
      if (selectedRecord) {
        // 更新
        await DailyVisitRecordService.updateDailyVisitRecord(selectedRecord.id, data as UpdateDailyVisitRecordInput);
      } else {
        // 新規作成
        await DailyVisitRecordService.createDailyVisitRecord(data as CreateDailyVisitRecordInput);
      }
      
      // データを再読み込み
      await loadData();
      setFormOpen(false);
    } catch (err) {
      console.error('保存エラー:', err);
      throw err; // フォームコンポーネントでエラーハンドリング
    } finally {
      setFormLoading(false);
    }
  };

  // 削除処理
  const handleDelete = async (record: DailyVisitRecord) => {
    try {
      setLoading(true);
      await DailyVisitRecordService.deleteDailyVisitRecord(record.id);
      await loadData();
    } catch (err) {
      console.error('削除エラー:', err);
      setError(err instanceof Error ? err.message : '削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ステータス変更処理
  const handleStatusChange = async (recordId: number, status: DailyVisitStatus, cancellationReason?: string) => {
    try {
      const updateData: UpdateDailyVisitRecordInput = {
        status,
        cancellationReason
      };
      
      await DailyVisitRecordService.updateDailyVisitRecord(recordId, updateData);
      await loadData();
      setStatusManagerOpen(false);
    } catch (err) {
      console.error('ステータス変更エラー:', err);
      throw err; // ステータス管理コンポーネントでエラーハンドリング
    }
  };

  // イベントのスタイル設定
  const eventStyleGetter = (event: CalendarEvent) => {
    const record = event.resource;
    let backgroundColor = '#3174ad';
    
    switch (record.status) {
      case 'completed':
        backgroundColor = '#4caf50'; // 緑
        break;
      case 'scheduled':
        backgroundColor = '#2196f3'; // 青
        break;
      case 'cancelled':
        backgroundColor = '#f44336'; // 赤
        break;
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // カスタムイベントコンポーネント
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const record = event.resource;
    
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'completed': return '完了';
        case 'scheduled': return '予定';
        case 'cancelled': return 'キャンセル';
        default: return status;
      }
    };
    
    return (
      <Tooltip title={
        <Box>
          <Typography variant="body2">{record.patient?.name}</Typography>
          <Typography variant="caption">{record.hygienist?.name}</Typography>
          <Typography variant="caption" display="block">
            ステータス: {getStatusLabel(record.status)}
          </Typography>
          {record.notes && (
            <Typography variant="caption" display="block">
              備考: {record.notes}
            </Typography>
          )}
        </Box>
      }>
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {event.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Chip 
              label={getStatusLabel(record.status)} 
              size="small" 
              sx={{ 
                height: 16, 
                fontSize: '0.6rem',
                backgroundColor: 'rgba(255,255,255,0.3)',
                color: 'white'
              }} 
            />
          </Box>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box className={className}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            日次訪問記録カレンダー
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedRecord(undefined);
                setSelectedDate(new Date());
                setFormOpen(true);
              }}
            >
              新規追加
            </Button>
            <IconButton onClick={loadData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <Box sx={{ height: 600, position: 'relative' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={messages}
            views={['month', 'week', 'day']}
            view={currentView}
            date={currentDate}
            onView={setCurrentView}
            onNavigate={setCurrentDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent
            }}
            step={30}
            timeslots={2}
            min={new Date(2024, 0, 1, 8, 0, 0)}
            max={new Date(2024, 0, 1, 18, 0, 0)}
          />
        </Box>

        {/* ステータス凡例 */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#4caf50', borderRadius: 1 }} />
            <Typography variant="caption">完了</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#2196f3', borderRadius: 1 }} />
            <Typography variant="caption">予定</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#f44336', borderRadius: 1 }} />
            <Typography variant="caption">キャンセル</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 詳細ダイアログ */}
        <DailyVisitRecordDetailDialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          record={detailRecord}
          onEdit={handleEditFromDetail}
          onDelete={handleDelete}
          onOpenStatusManager={(record) => {
            setStatusRecord(record);
            setStatusManagerOpen(true);
          }}
          loading={loading}
        />

      {/* フォームダイアログ */}
      <DailyVisitRecordForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        record={selectedRecord}
        selectedDate={selectedDate}
        patients={patients}
        hygienists={hygienists}
        loading={formLoading}
      />

      {/* ステータス管理ダイアログ */}
      <DailyVisitRecordStatusManager
        open={statusManagerOpen}
        onClose={() => setStatusManagerOpen(false)}
        record={statusRecord}
        onStatusChange={handleStatusChange}
        loading={loading}
      />
    </Box>
  );
};