import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ViolationList from './pages/ViolationList';
import ViolationDetail from './pages/ViolationDetail';
import TaskList from './pages/TaskList';
import ActionPlan from './pages/ActionPlan';
import OverdueReport from './pages/OverdueReport';
import { useApp } from './hooks/useApp';

export default function App() {
  const { violations, tasks, updateActionEvidence, closeViolation, updateActionStatus, updateTaskStatus } = useApp();

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard violations={violations} tasks={tasks} />} />
          <Route path="/violations" element={<ViolationList violations={violations} />} />
          <Route
            path="/violations/:id"
            element={
              <ViolationDetail
                violations={violations}
                onApproveEvidence={updateActionEvidence}
                onCloseViolation={closeViolation}
                onUpdateActionStatus={updateActionStatus}
              />
            }
          />
          <Route path="/tasks" element={<TaskList tasks={tasks} onUpdateTask={updateTaskStatus} />} />
          <Route path="/actions" element={<ActionPlan violations={violations} />} />
          <Route path="/overdue" element={<OverdueReport violations={violations} tasks={tasks} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
