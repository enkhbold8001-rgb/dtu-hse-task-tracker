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
  const {
    violations, tasks,
    isLoading, error, saveError,
    addViolation, updateViolation,
    addAction, updateAction, updateActionStatus, updateActionEvidence, addEvidence,
    closeViolation,
    addTask, updateTask,
  } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Өгөгдөл ачаалж байна...</p>
        </div>
      </div>
    );
  }

  if (error && violations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <p className="text-red-600 font-medium mb-2">Алдаа гарлаа</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        {saveError && (
          <div role="alert" className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            ⚠ {saveError}. Сүүлийн өөрчлөлт хадгалагдаагүй байна — хуудсыг дахин ачаалбал алга болно.
          </div>
        )}
        <Routes>
          <Route path="/" element={<Dashboard violations={violations} tasks={tasks} />} />
          <Route
            path="/violations"
            element={
              <ViolationList
                violations={violations}
                onAddViolation={addViolation}
                onUpdateViolation={updateViolation}
              />
            }
          />
          <Route
            path="/violations/:id"
            element={
              <ViolationDetail
                violations={violations}
                onApproveEvidence={updateActionEvidence}
                onCloseViolation={closeViolation}
                onUpdateActionStatus={updateActionStatus}
                onAddAction={addAction}
                onUpdateAction={updateAction}
                onAddEvidence={addEvidence}
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <TaskList
                tasks={tasks}
                violations={violations}
                onUpdateTask={updateTask}
                onAddTask={addTask}
              />
            }
          />
          <Route path="/actions" element={<ActionPlan violations={violations} />} />
          <Route path="/overdue" element={<OverdueReport violations={violations} tasks={tasks} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
