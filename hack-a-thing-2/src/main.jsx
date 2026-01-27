import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { DndProvider, useDrag, useDrop, useDragLayer } from 'react-dnd';
import { HTML5Backend, getEmptyImage } from 'react-dnd-html5-backend';
import './dressup.css';
import vitruvian from './assets/vitruvian.png';
import shirt from './assets/shirt.png';
import sombrero from './assets/sombrero.png';
import tutu from './assets/tutu.png';

// For this demo, images are given numeric IDs. Ideally, in production, these would be stored in the database.
// I didn't want to pay for Firebase storage but that is an option.
const images = {
    0: shirt,
    1: sombrero,
    2: tutu
}

const initialParts = {
    0: { x: 100, y: 200 },
    1: { x: 200, y: 50 },
    2: { x: 300, y: 300 }
}

async function getParts(db) {
    const partsCol = collection(db, 'parts');
    const partsSnapshot = await getDocs(partsCol);
    const partsList = partsSnapshot.docs.map(doc => doc.data());
    return partsList.map(item => item);
}

function DraggablePart({ id, x, y }) {
	const [{ isDragging }, drag, preview] = useDrag(() => ({
		type: "part",
		item: (monitor) => {
            const clientOffset = monitor.getClientOffset(); // mouse position
			const sourceOffset = monitor.getSourceClientOffset(); // object position

			let grabOffset = { x: 0, y: 0 };

			if (clientOffset && sourceOffset) {
                // set the grab offset based on where the user clicked the object
				grabOffset = {
					x: clientOffset.x - sourceOffset.x,
					y: clientOffset.y - sourceOffset.y
				};
			}

			return { id, grabOffset };
        },
		collect: monitor => ({
			isDragging: monitor.isDragging()
		})
	}));

    useEffect(() => {
		preview(getEmptyImage(), { captureDraggingState: true });
	}, [preview]);

	return (
		<img
			ref={drag}
			src={images[id]}
			alt={`Part ${id}`}
			style={{
				position: "absolute",
				left: x,
				top: y,
				width: "200px",
                height: "auto",
				cursor: "move",
				opacity: isDragging ? 0.5 : 1
			}}
		/>
	);
}

function CustomDragLayer() {
	const {
		isDragging,
		item,
		currentOffset
	} = useDragLayer(monitor => ({
		item: monitor.getItem(),
		currentOffset: monitor.getClientOffset(),
		isDragging: monitor.isDragging()
	}));

	if (!isDragging || !currentOffset) return null;

	const { x, y } = currentOffset;
    const { grabOffset } = item;

	return (
		<div style={layerStyles}>
			<img
				src={images[item.id]}
				style={{
					transform: `translate(${x - grabOffset.x}px, ${y - grabOffset.y}px)`,
					width: "200px",
					pointerEvents: "none",
					opacity: 0.9
				}}
			/>
		</div>
	);
}

const layerStyles = {
	position: 'fixed',
	pointerEvents: 'none',
	zIndex: 1000,
	left: 0,
	top: 0,
	width: '100%',
	height: '100%'
};

// definind the board as a separate component allows it to be called within the context of DndProvider
function Board() {
	const [parts, setParts] = useState(initialParts);

    // calls setParts to update internal state
	const movePart = (id, x, y) => {
		setParts(prev => ({
			...prev,
			[id]: { x, y }
		}));
	};

	const [, drop] = useDrop(() => ({
		accept: "part",
		drop: (item, monitor) => {
			const offset = monitor.getClientOffset();
			if (!offset) return;

			movePart(
                item.id,
                offset.x - item.grabOffset.x,
			    offset.y - item.grabOffset.y
            );
		}
	}));

	return (
		<div ref={drop} className="board">
			<h1>Welcome to the Dress-Up Game!</h1>

			<div className="image-container">
				<img src={vitruvian} alt="Vitruvian Man" />
			</div>

			{Object.entries(parts).map(([id, pos]) => (
				<DraggablePart key={id} id={id} x={pos.x} y={pos.y} />
			))}

            <CustomDragLayer />
		</div>
	);
}

function App() {
    return (
        <DndProvider backend={HTML5Backend}>
            <Board />
        </DndProvider>
    );
}

createRoot(document.getElementById("root")).render(
    <App />
);