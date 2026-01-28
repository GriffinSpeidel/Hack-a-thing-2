import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { DndProvider, useDrag, useDrop, useDragLayer } from 'react-dnd';
import { HTML5Backend, getEmptyImage } from 'react-dnd-html5-backend';
import { subscribeParts, updatePart } from "./db";
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

	// lets me define how the image looks when dragged (according to the scale I give it)
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
				width: "200px", // same size for all is fine for the demo
                height: "auto",
				cursor: "move",
				opacity: isDragging ? 0.5 : 1
			}}
		/>
	);
}

// this component
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

// defining the board as a separate component allows it to be called within the context of DndProvider
function Board() {
	const [parts, setParts] = useState(initialParts);

	// from ChatGPT: "how do I updater the positions of parts based on realtime updates in a firestore database?"
    useEffect(() => {
        // subscribeParts returns an unsubscribe function
        const unsubscribe = subscribeParts(setParts);

        // cleanup on unmount
        return () => unsubscribe();
    }, []);

    // calls setParts to update internal state
	const movePart = (id, x, y) => {
        // update local state
		setParts(prev => ({
			...prev,
			[id]: { x, y }
		}));

        // update in Firestore
        updatePart(id, { x, y });
	};

    const imageRef = useRef(null);

	// the useDrop hook enables the board to accept dropped items
	const [, drop] = useDrop(() => ({
		accept: "part",
		drop: (item, monitor) => {
			const clientOffset = monitor.getClientOffset();
			if (!clientOffset || !imageRef) return;

            const rect = imageRef.current.getBoundingClientRect();

			movePart(
                item.id,
                clientOffset.x - rect.left - item.grabOffset.x,
			    clientOffset.y - rect.top - item.grabOffset.y
            );
		}
	}));

	return (
		<div ref={drop} className="board">
			<h1>Welcome to the Dress-Up Game!</h1>

			<div className="image-container" ref={imageRef}>
				<img src={vitruvian} alt="Vitruvian Man" />

                {Object.entries(parts).map(([id, pos]) => (
                    <DraggablePart key={id} id={id} x={pos.x} y={pos.y} />
                ))}
			</div>

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