const Vector3Int = require("./vector3Int");

/**
* This represents a chunk inside the brain's 3D database system
*/
class NeuralChunk{

	constructor(x,y,z){
		/** @property {int[int[int[Neuron]]]} neurons 3D object map where indices represent the neuron's location - the final value is the Neuron itself */
		this.neurons = {};

		/** @property {Neuron[]} neurons The neruons in this chunk without indexing optimization */
		this.rawNeurons = [];

		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	* Adds a neuron to the chunk at a given position
	*
	* @param {Neuron} neuron
	* @param {int} x
	* @param {int} y
	* @param {int} z
	* @return {undefined}
	*/
	addNeuron(neuron){
		const neuronPosition = neuron.getPositionAsVector3Int()
		let x = neuronPosition.x;
		let y = neuronPosition.y;
		let z = neuronPosition.z;
		this.rawNeurons.push(neuron);

		// Create the properties of the object if they do not exist
		if (!(x in this.neurons)){
			this.neurons[x] = {};
		}
		if (!(y in this.neurons[x])){
			this.neurons[x][y] = {};
		}

		// Does a neuron already exist at this point?
		if (z in this.neurons[x][y]){
			throw `Neuron collision! Cannot add neuron to this chunk because a neuron exists at (${x}, ${y}, ${z})`;
		}

		this.neurons[x][y][z] = neuron;

		return undefined;
	}

	/**
	* Gets the neuron at a position in this chunk
	*
	* @param {Vector3Int} position
	* @return {Neuron|undefined}
	*/
	getNeuronFromPosition(position){
		if (position.x in this.neurons){
			if (position.y in this.neurons[position.x]){
				if (position.z in this.neurons[position.x][position.y]){
					return this.neurons[position.x][position.y][position.z];
				}
			}
		}

		return undefined;
	}

	/**
	* Determines if there are empty neurons available in this chunk
	*
	* @param {bool}
	*/
	hasEmptyNeurons(){
		for (let i = 0; i < this.rawNeurons; ++i){
			if (this.rawNeurons[i].data === ""){
				return true;
			}
		}

		return false;
	}

	/**
	* Returns all adjacent chunk positions
	*
	* Returns all chunks cubed around this chunk (includes edge cases and corners, for a total of 26 chunks) These are not guaranteed chunks. You must also check that these returned position actually exist as valid chunks
	*
	* @param {Vector3Int[]}
	*/
	getAdjacentChunkPositions(){

		let adjacentChunks = [];

		// NEED A TOTAL OF 26 CHUNKS TO BE ACCURATE

		// All corners (8 chunks) : total 8 so far
		adjacentChunks.push(new Vector3Int(this.x + 1, this.x + 1, this.z + 1));
		adjacentChunks.push(new Vector3Int(this.x + 1, this.x + 1, this.z - 1));
		adjacentChunks.push(new Vector3Int(this.x - 1, this.x + 1, this.z + 1));
		adjacentChunks.push(new Vector3Int(this.x - 1, this.x + 1, this.z - 1));
		adjacentChunks.push(new Vector3Int(this.x + 1, this.x - 1, this.z + 1));
		adjacentChunks.push(new Vector3Int(this.x + 1, this.x - 1, this.z - 1));
		adjacentChunks.push(new Vector3Int(this.x - 1, this.x - 1, this.z + 1));
		adjacentChunks.push(new Vector3Int(this.x - 1, this.x - 1, this.z - 1));

		// All directly adjacent cross faces (top, left, bottom, front, right)
		// (6 chunks) : total 14 so far
		adjacentChunks.push(new Vector3Int(this.x, this.x + 1, this.z));
		adjacentChunks.push(new Vector3Int(this.x, this.x - 1, this.z));
		adjacentChunks.push(new Vector3Int(this.x + 1, this.x, this.z));
		adjacentChunks.push(new Vector3Int(this.x - 1, this.x, this.z));
		adjacentChunks.push(new Vector3Int(this.x, this.x, this.z + 1));
		adjacentChunks.push(new Vector3Int(this.x, this.x, this.z - 1));

		// All edge-meeting chunks
		// (8 chunks) : total 22 so far
		adjacentChunks.push(new Vector3Int(this.x + 1, this.x + 1, this.z));
		adjacentChunks.push(new Vector3Int(this.x + 1, this.x - 1, this.z));
		adjacentChunks.push(new Vector3Int(this.x - 1, this.x + 1, this.z));
		adjacentChunks.push(new Vector3Int(this.x - 1, this.x - 1, this.z));
		adjacentChunks.push(new Vector3Int(this.x, this.x + 1, this.z + 1));
		adjacentChunks.push(new Vector3Int(this.x, this.x - 1, this.z + 1));
		adjacentChunks.push(new Vector3Int(this.x, this.x + 1, this.z - 1));
		adjacentChunks.push(new Vector3Int(this.x, this.x - 1, this.z - 1));

		// All vertically middle corner chunks (chunks in between two corners)
		// (4 chunks) : total 26 so far (done here)
		adjacentChunks.push(new Vector3Int(this.x + 1, this.x, this.z + 1));
		adjacentChunks.push(new Vector3Int(this.x + 1, this.x, this.z - 1));
		adjacentChunks.push(new Vector3Int(this.x - 1, this.x, this.z + 1));
		adjacentChunks.push(new Vector3Int(this.x - 1, this.x, this.z - 1));

		return adjacentChunks;
	}

	/**
	* Determines if this chunk is the same as another
	*
	* @param {NeuralChunk} otherChunk
	* @return {bool}
	*/
	isEqual(otherChunk){
		return otherChunk.x === this.x && otherChunk.y === this.y && otherChunk.z === this.z
	}

	/**
	* Gets the chunk position from a world position
	*
	* @param {Vector3Int} v3
	* @param {int} chunkSize All chunks are cubes, so only one size is needed
	* @param {int} worldSize All worlds use negative coordinates, so an offset is created using this number
	* @return {Vector3Int}
	*/
	static getChunkPositionFromWorldPosition(v3, chunkSize, worldSize){
		let chunkXCoordinate = Math.floor( (v3.x + worldSize) / chunkSize );
		let chunkYCoordinate = Math.floor( (v3.y + worldSize) / chunkSize );
		let chunkZCoordinate = Math.floor( (v3.z + worldSize) / chunkSize );

		return new Vector3Int(chunkXCoordinate, chunkYCoordinate, chunkZCoordinate);
	}

	/**
	* Will return any chunk positions nearby to the point if that point is nearby a chunk edge
	*
	* @param {Vector3Int} point The point to find edge chunks for
	* @param {int} worldSize The size of the world because this system uses negatives when generating a world. Only one world size because the world is uniformly cubical
	* @param {int} chunkSize Size of the world's chunks. Only one size is needed because the world is a cube
	* @param {float} edgeDistanceThreshold Should always be less than 1. 0.2 = 20% near an edge will be considered an edge case, and so on
	* @return {Vector3Int[]} An array of the chunk coordinates that need to be considered because of edge cases
	*/
	static getChunkPositionsFromPointEdgeCases(point, worldSize, chunkSize, edgeDistanceThreshold){
		const position = point;

		// The edge chunk coordinates considered nearby this point, if any
		let edgeChunkCoordinatesCloseby = [];

		const thisChunkPosition = NeuralChunk.getChunkPositionFromWorldPosition(point, chunkSize, worldSize);
		const worldSizeOffset = worldSize; // Because the world includes negatives, the world position must be offset to be all positive. The world is square, so only one number is needed for all axes. No need for worldSizeOffsetX and so on

		// Get the non-negative world position
		const xPositionInChunkWorldCoordinates = (position.x + worldSizeOffset);
		// Get the chunk coordinate, but do not round off the decimal yet - this decimal is important
		const floatingChunkCoordinateOfX = xPositionInChunkWorldCoordinates / chunkSize;
		// Get the decimal of the chunk coordinate from the position - the decimal is the percentage distance to the next chunk
		const xCoordinateChunkDecimal = xPositionInChunkWorldCoordinates - Math.floor(xPositionInChunkWorldCoordinates);

		// Do the same calculations for Y and Z
		const yPositionInChunkWorldCoordinates = (position.y + worldSizeOffset);
		const floatingChunkCoordinateOfY = yPositionInChunkWorldCoordinates / chunkSize;
		const yCoordinateChunkDecimal = yPositionInChunkWorldCoordinates - Math.floor(yPositionInChunkWorldCoordinates);

		const zPositionInChunkWorldCoordinates = (position.z + worldSizeOffset);
		const floatingChunkCoordinateOfZ = zPositionInChunkWorldCoordinates / chunkSize;
		const zCoordinateChunkDecimal = zPositionInChunkWorldCoordinates - Math.floor(zPositionInChunkWorldCoordinates);

		const isXNearLeftBoundary = xCoordinateChunkDecimal < edgeDistanceThreshold;
		const isXNearRightBoundary = (1 - xCoordinateChunkDecimal) < edgeDistanceThreshold;

		const isYNearBottomBoundary = yCoordinateChunkDecimal < edgeDistanceThreshold;
		const isYNearTopBoundary = (1 - yCoordinateChunkDecimal) < edgeDistanceThreshold;

		const isZNearBackBoundary = zCoordinateChunkDecimal < edgeDistanceThreshold;
		const isZNearFrontBoundary = (1 - zCoordinateChunkDecimal) < edgeDistanceThreshold;

		// Gather left or right chunk if necessary
		if (isXNearLeftBoundary){
			edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x - 1, thisChunkPosition.y, thisChunkPosition.z));

			if (isYNearTopBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x - 1, thisChunkPosition.y + 1, thisChunkPosition.z));
			}else if (isYNearBottomBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x - 1, thisChunkPosition.y - 1, thisChunkPosition.z));
			}

		}else if (isXNearRightBoundary){
			edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x + 1, thisChunkPosition.y, thisChunkPosition.z));

			if (isYNearTopBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x + 1, thisChunkPosition.y + 1, thisChunkPosition.z));
			}else if (isYNearBottomBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x + 1, thisChunkPosition.y - 1, thisChunkPosition.z));
			}
		}

		// Gather top or bottom chunk if necessary
		if (isYNearBottomBoundary){
			edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x, thisChunkPosition.y - 1, thisChunkPosition.z));
		}else if (isYNearTopBoundary){
			edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x, thisChunkPosition.y + 1, thisChunkPosition.z));
		}

		// Gather front or back chunk if necessary
		if (isZNearBackBoundary){
			edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x, thisChunkPosition.y, thisChunkPosition.z - 1));

			if (isYNearTopBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x, thisChunkPosition.y + 1, thisChunkPosition.z - 1));
			}else if (isYNearBottomBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x, thisChunkPosition.y - 1, thisChunkPosition.z - 1));
			}

		}else if (isZNearFrontBoundary){
			edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x, thisChunkPosition.y, thisChunkPosition.z + 1));

			if (isYNearTopBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x, thisChunkPosition.y + 1, thisChunkPosition.z + 1));
			}else if (isYNearBottomBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x, thisChunkPosition.y - 1, thisChunkPosition.z + 1));
			}
		}

		/*
			Determine all CORNER cases.
		*/

		// If near both RIGHT and FRONT, then get the RIGHT-FRONT corner
		if (isXNearRightBoundary && isZNearFrontBoundary){
			edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x + 1, thisChunkPosition.y, thisChunkPosition.z + 1));

			// Is it near the bottom or top? Then gather the RIGHT-FRONT-BOTTOM corner or the RIGHT-FRONT-TOP corner
			if (isYNearTopBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x + 1, thisChunkPosition.y + 1, thisChunkPosition.z + 1));
			}else if (isYNearBottomBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x + 1, thisChunkPosition.y - 1, thisChunkPosition.z + 1));
			}
		}

		// If near both LEFT and FRONT, then get the LEFT-FRONT corner
		if (isXNearLeftBoundary && isZNearFrontBoundary){
			edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x - 1, thisChunkPosition.y, thisChunkPosition.z + 1));

			// Is it near the bottom or top? Then gather the LEFT-FRONT-BOTTOM corner or the LEFT-FRONT-TOP corner
			if (isYNearTopBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x - 1, thisChunkPosition.y + 1, thisChunkPosition.z + 1));
			}else if (isYNearBottomBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x - 1, thisChunkPosition.y - 1, thisChunkPosition.z + 1));
			}
		}

		// If near both RIGHT and BACK, then get the RIGHT-BACK corner
		if (isXNearRightBoundary && isZNearBackBoundary){
			edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x + 1, thisChunkPosition.y, thisChunkPosition.z - 1));

			// Is it near the bottom or top? Then gather the RIGHT-BACK-BOTTOM corner or the RIGHT-BACK-TOP corner
			if (isYNearTopBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x + 1, thisChunkPosition.y + 1, thisChunkPosition.z - 1));
			}else if (isYNearBottomBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x + 1, thisChunkPosition.y - 1, thisChunkPosition.z - 1));
			}
		}

		// If near both LEFT and BACK, then get the LEFT-BACK corner
		if (isXNearLeftBoundary && isZNearBackBoundary){
			edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x - 1, thisChunkPosition.y, thisChunkPosition.z - 1));

			// Is it near the bottom or top? Then gather the LEFT-BACK-BOTTOM corner or the LEFT-BACK-TOP corner
			if (isYNearTopBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x - 1, thisChunkPosition.y + 1, thisChunkPosition.z - 1));
			}else if (isYNearBottomBoundary){
				edgeChunkCoordinatesCloseby.push(new Vector3Int(thisChunkPosition.x - 1, thisChunkPosition.y - 1, thisChunkPosition.z - 1));
			}
		}

		return edgeChunkCoordinatesCloseby;
	}

	toJSON(){
		let obj = {};
		obj.rawNeurons = this.rawNeurons;
		return obj;
	}
}

module.exports = NeuralChunk;