<template>
  <li class="group w-full hover:bg-base-300"
      :class="{
        'bg-base-300': isActive,
        'bg-base-100/80': session.isPinned
      }">
    <!-- Session Content -->
    <div class="w-full flex flex-col gap-1 px-4 py-3 min-h-[3.5rem] cursor-pointer relative" @click="$emit('select')">
      <div v-if="isEditing" class="w-full" @click.stop>
        <input 
          ref="titleInput"
          v-model="editTitle"
          @blur="saveTitle"
          @keyup.enter="saveTitle"
          @keyup.esc="cancelEditing"
          class="input input-sm input-bordered w-full bg-base-100"
          :placeholder="t('common.newChat')"
        />
      </div>
      <div v-else class="w-full text-left text-sm truncate text-base-content font-medium flex gap-2">
        <component 
          :is="session.isPinned ? StarIconSolid : StarIcon" 
          class="h-4 w-4 text-warning" 
          v-if="session.isPinned"
        />
        {{ session.title || t('common.newChat') }}
      </div>
      <div class="w-full text-left text-xs text-base-content/60">{{ formattedDate }}</div>
    </div>
    
    <!-- Action Icons -->
    <div class="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-base-300/50 rounded-lg px-1 z-10" @click.stop>
      <button 
        @click.stop="$emit('toggle-pin')"
        class="btn btn-ghost btn-xs"
        :title="session.isPinned ? t('common.unpin') : t('common.pin')"
      >
        <component 
          :is="session.isPinned ? StarIconSolid : StarIcon"
          class="h-4 w-4" 
          :class="{ 'text-warning': session.isPinned }"
        />
      </button>
      <button 
        @click.stop="startEditing"
        class="btn btn-ghost btn-xs"
        :title="t('common.rename')"
      >
        <PencilIcon class="h-4 w-4" />
      </button>
      <button 
        @click.stop="$emit('remove')"
        class="btn btn-ghost btn-xs text-error"
        :title="t('common.delete')"
      >
        <TrashIcon class="h-4 w-4" />
      </button>
    </div>
  </li>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatDate } from '../../../utils/dateFormatter';
import {
  PencilIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/vue/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid';

const props = defineProps({
  session: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    required: true
  },
  t: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['select', 'update', 'remove', 'toggle-pin']);

const isEditing = ref(false);
const editTitle = ref('');
const titleInput = ref(null);

const formattedDate = computed(() => formatDate(props.session.timestamp, props.language));

const startEditing = () => {
  editTitle.value = props.session.title || '';
  isEditing.value = true;
  // Focus the input after the next DOM update
  setTimeout(() => {
    titleInput.value?.focus();
  });
};

const saveTitle = () => {
  const newTitle = editTitle.value?.trim();
  if (!newTitle) {
    cancelEditing();
    return;
  }

  if (newTitle !== props.session.title) {
    emit('update', newTitle);
  }
  
  cancelEditing();
};

const cancelEditing = () => {
  isEditing.value = false;
  editTitle.value = '';
};
</script>
