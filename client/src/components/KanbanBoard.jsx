import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const COLUMNS = [
  {
    id: 'todo',
    label: 'To Do',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  {
    id: 'done',
    label: 'Done',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
];

const groupByStatus = (tasks) => {
  const groups = { todo: [], 'in-progress': [], done: [] };
  tasks.forEach((task) => {
    if (groups[task.status]) groups[task.status].push(task);
    else groups.todo.push(task);
  });
  return groups;
};

const KanbanBoard = ({ tasks, onTaskClick, onTaskMove, canMove = true }) => {
  const [columns, setColumns] = useState(groupByStatus(tasks));

  useEffect(() => {
    setColumns(groupByStatus(tasks));
  }, [tasks]);

  const onDragEnd = (result) => {
    if (!canMove) return;
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;

    const newColumns = { ...columns };
    const srcTasks = [...newColumns[srcCol]];
    const [moved] = srcTasks.splice(source.index, 1);
    newColumns[srcCol] = srcTasks;

    const dstTasks = srcCol === dstCol ? srcTasks : [...newColumns[dstCol]];
    dstTasks.splice(destination.index, 0, { ...moved, status: dstCol });
    newColumns[dstCol] = dstTasks;

    setColumns(newColumns);
    onTaskMove?.(draggableId, dstCol, destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-4 min-h-[500px]">
        {COLUMNS.map((col) => (
          <div key={col.id} className="kanban-col flex-shrink-0">
            {/* Column header */}
            <div className={`kanban-col-header bg-white`}>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
              </div>
              <span className={`badge ${col.bg} ${col.color} border ${col.border}`}>
                {columns[col.id]?.length || 0}
              </span>
            </div>

            {/* Tasks */}
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-3 space-y-3 min-h-[400px] transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-blue-50/60' : ''
                  }`}
                >
                  {columns[col.id]?.map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                      isDragDisabled={!canMove}
                    >
                      {(prov, snap) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          className={`transition-all duration-150 ${snap.isDragging ? 'rotate-1 scale-105 shadow-elevated z-50' : ''}`}
                        >
                          <TaskCard task={task} onClick={onTaskClick} compact />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {columns[col.id]?.length === 0 && !snapshot.isDraggingOver && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">No tasks</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
