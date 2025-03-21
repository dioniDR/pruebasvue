<template>
  <div 
    class="modal-window" 
    :class="{ 'active': isActive }" 
    :style="windowStyle"
    @mousedown.stop="startDrag($event, 'move')"
  >
    <!-- Barra de título -->
    <div class="window-header" @mousedown.stop="startDrag($event, 'move')">
      <div class="window-title">{{ title }}</div>
      <div class="window-controls">
        <button class="window-close" @click="close">×</button>
      </div>
    </div>

    <!-- Contenido -->
    <div class="window-content">
      <slot></slot>
    </div>

    <!-- Bordes para redimensionar -->
    <div class="resize-handle top-left" @mousedown.stop="startDrag($event, 'top-left')"></div>
    <div class="resize-handle top-right" @mousedown.stop="startDrag($event, 'top-right')"></div>
    <div class="resize-handle bottom-left" @mousedown.stop="startDrag($event, 'bottom-left')"></div>
    <div class="resize-handle bottom-right" @mousedown.stop="startDrag($event, 'bottom-right')"></div>
    <div class="resize-handle top" @mousedown.stop="startDrag($event, 'top')"></div>
    <div class="resize-handle right" @mousedown.stop="startDrag($event, 'right')"></div>
    <div class="resize-handle bottom" @mousedown.stop="startDrag($event, 'bottom')"></div>
    <div class="resize-handle left" @mousedown.stop="startDrag($event, 'left')"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'ModalWindow',
  props: {
    title: {
      type: String,
      default: 'Ventana'
    },
    initialWidth: {
      type: Number,
      default: 500
    },
    initialHeight: {
      type: Number,
      default: 400
    },
    initialTop: {
      type: Number,
      default: 100
    },
    initialLeft: {
      type: Number,
      default: 100
    },
    minWidth: {
      type: Number,
      default: 200
    },
    minHeight: {
      type: Number,
      default: 150
    },
    zIndex: {
      type: Number,
      default: 1000
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const isActive = ref(true);
    const position = ref({
      top: props.initialTop,
      left: props.initialLeft,
      width: props.initialWidth,
      height: props.initialHeight
    });
    
    const isDragging = ref(false);
    const dragType = ref('');
    const startPosition = ref({
      mouseX: 0,
      mouseY: 0,
      top: 0,
      left: 0,
      width: 0,
      height: 0
    });

    const windowStyle = computed(() => {
      return {
        top: `${position.value.top}px`,
        left: `${position.value.left}px`,
        width: `${position.value.width}px`,
        height: `${position.value.height}px`,
        zIndex: props.zIndex
      };
    });

    const startDrag = (event, type) => {
      isDragging.value = true;
      dragType.value = type;
      
      startPosition.value = {
        mouseX: event.clientX,
        mouseY: event.clientY,
        top: position.value.top,
        left: position.value.left,
        width: position.value.width,
        height: position.value.height
      };
      
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
    };

    const onDrag = (event) => {
      if (!isDragging.value) return;
      
      const deltaX = event.clientX - startPosition.value.mouseX;
      const deltaY = event.clientY - startPosition.value.mouseY;
      
      switch(dragType.value) {
        case 'move':
          position.value.top = startPosition.value.top + deltaY;
          position.value.left = startPosition.value.left + deltaX;
          break;
        case 'top-left':
          const newWidthTL = startPosition.value.width - deltaX;
          const newHeightTL = startPosition.value.height - deltaY;
          
          if (newWidthTL >= props.minWidth) {
            position.value.width = newWidthTL;
            position.value.left = startPosition.value.left + deltaX;
          }
          
          if (newHeightTL >= props.minHeight) {
            position.value.height = newHeightTL;
            position.value.top = startPosition.value.top + deltaY;
          }
          break;
        case 'top-right':
          const newWidthTR = startPosition.value.width + deltaX;
          const newHeightTR = startPosition.value.height - deltaY;
          
          if (newWidthTR >= props.minWidth) {
            position.value.width = newWidthTR;
          }
          
          if (newHeightTR >= props.minHeight) {
            position.value.height = newHeightTR;
            position.value.top = startPosition.value.top + deltaY;
          }
          break;
        case 'bottom-left':
          const newWidthBL = startPosition.value.width - deltaX;
          const newHeightBL = startPosition.value.height + deltaY;
          
          if (newWidthBL >= props.minWidth) {
            position.value.width = newWidthBL;
            position.value.left = startPosition.value.left + deltaX;
          }
          
          if (newHeightBL >= props.minHeight) {
            position.value.height = newHeightBL;
          }
          break;
        case 'bottom-right':
          const newWidthBR = startPosition.value.width + deltaX;
          const newHeightBR = startPosition.value.height + deltaY;
          
          if (newWidthBR >= props.minWidth) {
            position.value.width = newWidthBR;
          }
          
          if (newHeightBR >= props.minHeight) {
            position.value.height = newHeightBR;
          }
          break;
        case 'top':
          const newHeightT = startPosition.value.height - deltaY;
          
          if (newHeightT >= props.minHeight) {
            position.value.height = newHeightT;
            position.value.top = startPosition.value.top + deltaY;
          }
          break;
        case 'right':
          const newWidthR = startPosition.value.width + deltaX;
          
          if (newWidthR >= props.minWidth) {
            position.value.width = newWidthR;
          }
          break;
        case 'bottom':
          const newHeightB = startPosition.value.height + deltaY;
          
          if (newHeightB >= props.minHeight) {
            position.value.height = newHeightB;
          }
          break;
        case 'left':
          const newWidthL = startPosition.value.width - deltaX;
          
          if (newWidthL >= props.minWidth) {
            position.value.width = newWidthL;
            position.value.left = startPosition.value.left + deltaX;
          }
          break;
      }
    };

    const stopDrag = () => {
      isDragging.value = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    const close = () => {
      isActive.value = false;
      emit('close');
    };

    // Limpiar event listeners cuando se desmonta el componente
    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    });

    return {
      isActive,
      position,
      windowStyle,
      startDrag,
      close
    };
  }
}
</script>

<style scoped>
.modal-window {
  position: absolute;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.2s, transform 0.2s;
  border: 1px solid #e0e0e0;
}

.modal-window.active {
  opacity: 1;
  transform: scale(1);
}

.window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  cursor: move;
  user-select: none;
}

.window-title {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  flex-grow: 1;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.window-close {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.window-close:hover {
  background-color: #d32f2f;
}

.window-content {
  flex-grow: 1;
  overflow: auto;
  padding: 16px;
}

/* Handles para redimensionar */
.resize-handle {
  position: absolute;
  background-color: transparent;
}

.top-left, .top-right, .bottom-left, .bottom-right {
  width: 12px;
  height: 12px;
  z-index: 10;
}

.top, .bottom {
  height: 6px;
  left: 12px;
  right: 12px;
  cursor: ns-resize;
}

.left, .right {
  width: 6px;
  top: 12px;
  bottom: 12px;
  cursor: ew-resize;
}

.top-left {
  top: 0;
  left: 0;
  cursor: nwse-resize;
}

.top-right {
  top: 0;
  right: 0;
  cursor: nesw-resize;
}

.bottom-left {
  bottom: 0;
  left: 0;
  cursor: nesw-resize;
}

.bottom-right {
  bottom: 0;
  right: 0;
  cursor: nwse-resize;
}

.top {
  top: 0;
}

.right {
  right: 0;
}

.bottom {
  bottom: 0;
}

.left {
  left: 0;
}
</style>