import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Removed react-beautiful-dnd imports
// Import dnd-kit components
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import './App.css';
import FullScreenMemoView from './FullScreenMemoView'; // Import the new component

const API_URL = '/api/memos';

// New Sortable Item Component using dnd-kit
function SortableMemoItem({ id, memo, editingMemoId, editTitle, editContent, setEditTitle, setEditContent, handleSaveEdit, handleCancelEdit, handleEditClick, handleDeleteMemo, isExpanded, onToggleExpand, handleViewFullScreen }) { // Added handleViewFullScreen
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Add visual feedback for dragging
    zIndex: isDragging ? 1 : 'auto', // Ensure dragged item is on top
  };

  // Calculate line count
  const lines = memo.Content.split('\n');
  const lineCount = lines.length;
  const showToggleButton = lineCount > 2; // Show button if more than 2 lines

  // Get content preview (first 2 lines)
  const contentPreview = lines.slice(0, 2).join('\n');

  return (
    <li
      ref={setNodeRef}
      style={style}
      // Remove {...attributes} from here if they are only for dragging
      className={`memo-item ${isDragging ? 'dragging' : ''}`}
    >
      {/* Apply drag listeners ONLY to a specific handle (e.g., the title area or a dedicated handle icon) */}
      {/* Remove outer div with listeners */} 
      {editingMemoId === memo.ID ? (
        <div className="edit-form">
          {/* Edit form content remains the same */}
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
            autoFocus
            maxLength="100" // Change character limit to 100
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="edit-buttons">
            {/* Keep stopPropagation here */}
            <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(memo.ID); }} className="save-button">Save</button>
            <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} className="cancel-button">Cancel</button>
          </div>
        </div>
      ) : (
        <div onClick={() => handleViewFullScreen && handleViewFullScreen(memo)} style={{ cursor: 'pointer' }}> {/* Add onClick for full screen */}
          {/* Apply drag handle listeners and attributes here */}
          {/* Make title the drag handle, stop propagation on title click to prevent full screen */} 
          <h3 {...attributes} {...listeners} style={{ cursor: 'grab' }} onClick={(e) => e.stopPropagation()}> 
            {memo.Title}
          </h3>
          {/* Conditionally render content based on isExpanded and line count */}
          <p style={{ whiteSpace: 'pre-wrap' }}> {/* Use pre-wrap to preserve line breaks */} 
            {isExpanded ? memo.Content : (lineCount > 2 ? `${contentPreview}\n...` : memo.Content)}
          </p>
          {/* Add Expand/Collapse button if line count exceeds threshold */}
          {showToggleButton && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleExpand(id); }} 
              className="toggle-expand-button" // Ensure class name is present
              // Remove inline style attribute
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
          <div className="memo-actions">
            {/* Keep stopPropagation on buttons */}
            <button onClick={(e) => { e.stopPropagation(); handleEditClick(memo); }} className="edit-button">Edit</button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteMemo(memo.ID); }} className="delete-button">Delete</button>
          </div>
        </div>
      )}
      {/* Removed the outer div that previously had listeners */}
    </li>
  );
}

function App() {
  const [memos, setMemos] = useState([]);
  const [newMemoTitle, setNewMemoTitle] = useState('');
  const [newMemoContent, setNewMemoContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingMemoId, setEditingMemoId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [expandedMemoIds, setExpandedMemoIds] = useState(new Set()); // State for expanded memos
  const [fullScreenMemo, setFullScreenMemo] = useState(null); // State for full screen view

  // Setup sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMemos();
  }, []);

  const fetchMemos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      const sortedMemos = (response.data || []).sort((a, b) => new Date(b.UpdatedAt) - new Date(a.UpdatedAt));
      setMemos(sortedMemos);
    } catch (err) {
      console.error("Error fetching memos:", err);
      setError('Failed to load memos. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemo = async (e) => {
    e.preventDefault();
    if (!newMemoTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }
    try {
      const response = await axios.post(API_URL, {
        title: newMemoTitle,
        content: newMemoContent,
      });
      // Add new memo, ensure it's not expanded by default
      setMemos([response.data, ...memos]);
      setNewMemoTitle('');
      setNewMemoContent('');
    } catch (err) {
      console.error("Error adding memo:", err);
      setError('Failed to add memo.');
    }
  };

  const handleDeleteMemo = async (id) => {
    if (window.confirm('Are you sure you want to delete this memo?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setMemos(memos.filter((memo) => memo.ID !== id));
        // Remove from expanded set if deleted
        setExpandedMemoIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id.toString());
          return newSet;
        });
      } catch (err) {
        console.error("Error deleting memo:", err);
        setError('Failed to delete memo.');
      }
    }
  };

  const handleEditClick = (memo) => {
    setEditingMemoId(memo.ID);
    setEditTitle(memo.Title);
    setEditContent(memo.Content);
    // Collapse memo when editing starts
    setExpandedMemoIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(memo.ID.toString());
        return newSet;
    });
  };

  const handleCancelEdit = () => {
    setEditingMemoId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleSaveEdit = async (id) => {
    if (!editTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        title: editTitle,
        content: editContent,
      });
      setMemos(memos.map((memo) => (memo.ID === id ? response.data : memo)));
      handleCancelEdit();
    } catch (err) {
      console.error("Error updating memo:", err);
      setError('Failed to update memo.');
    }
  };

  // Function to toggle expanded state for a memo
  const toggleExpandMemo = (id) => {
    setExpandedMemoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // --- dnd-kit Drag End Handler ---
  function handleDragEnd(event) {
    const { active, over } = event;

    // Remove console logs
    // console.log('Drag End Event:', event);
    // console.log('Active ID:', active.id, 'Over ID:', over?.id); 

    if (over && active.id !== over.id) {
      setMemos((items) => {
        const oldIndex = items.findIndex((item) => item.ID.toString() === active.id);
        const newIndex = items.findIndex((item) => item.ID.toString() === over.id);

        // Remove console logs
        // console.log('Old Index:', oldIndex, 'New Index:', newIndex); 

        if (oldIndex === -1 || newIndex === -1) {
          // console.error('Could not find item index for ID:', active.id, 'or', over.id);
          return items; // Return original items if index not found
        }

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Remove console logs
        // console.log('New Items Order:', newItems.map(item => item.ID)); 

        // Use arrayMove for immutable reordering
        return newItems;
      });
      // Optional: Persist order in backend here
    }
  }
  // --- End dnd-kit Drag End Handler ---

  // --- Full Screen View Handlers ---
  const handleViewFullScreen = (memo) => {
    setFullScreenMemo(memo);
  };

  const handleCloseFullScreen = () => {
    setFullScreenMemo(null);
  };
  // --- End Full Screen View Handlers ---

  return (
    <div className="App">
      <h1>Go Notes</h1>

      <form onSubmit={handleAddMemo} className="add-memo-form">
        <input
          type="text"
          placeholder="New Note Title"
          value={newMemoTitle}
          onChange={(e) => setNewMemoTitle(e.target.value)}
          required
          maxLength="100" // Change character limit to 100
        />
        <textarea
          placeholder="Start typing..."
          value={newMemoContent}
          onChange={(e) => setNewMemoContent(e.target.value)}
        />
        <button type="submit">Add Note</button>
      </form>

      {loading && <p>Loading notes...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && memos.length === 0 && <p>No notes yet. Add one above!</p>}

      {/* Replace DragDropContext with DndContext */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Replace Droppable with SortableContext */}
        <SortableContext
          items={memos.map(memo => memo.ID.toString())} // Pass array of IDs
          strategy={verticalListSortingStrategy}
        >
          <ul className="memo-list">
            {memos.map((memo) => (
              // Render the new SortableMemoItem component
              <SortableMemoItem
                key={memo.ID.toString()}
                id={memo.ID.toString()} // Pass ID to useSortable
                memo={memo}
                editingMemoId={editingMemoId}
                editTitle={editTitle}
                editContent={editContent}
                setEditTitle={setEditTitle}
                setEditContent={setEditContent}
                handleSaveEdit={handleSaveEdit}
                handleCancelEdit={handleCancelEdit}
                handleEditClick={handleEditClick}
                handleDeleteMemo={handleDeleteMemo}
                isExpanded={expandedMemoIds.has(memo.ID.toString())} // Pass expanded state
                onToggleExpand={toggleExpandMemo} // Pass toggle function
                handleViewFullScreen={handleViewFullScreen} // Pass full screen handler
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {/* Use the FullScreenMemoView component */}
      <FullScreenMemoView memo={fullScreenMemo} onClose={handleCloseFullScreen} />
    </div>
  );
}

export default App;
