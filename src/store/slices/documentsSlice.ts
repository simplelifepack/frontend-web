import { refreshUsage } from "./usageSlice";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, type AnalyzeDocumentResponse, type DocumentRecord, type SaveDocumentPayload } from "@/lib/api";
import { initializeApp } from "../bootstrap";
import type { RootState } from "../index";

type DocumentsState = {
  items: DocumentRecord[];
  selected: DocumentRecord | null;
  pendingAnalysis: AnalyzeDocumentResponse | null;
  pendingAnalysisQueue: AnalyzeDocumentResponse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  analyzeStatus: "idle" | "loading" | "succeeded" | "failed";
  uploadStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  loaded: boolean;
};

const initialState: DocumentsState = {
  items: [],
  selected: null,
  pendingAnalysis: null,
  pendingAnalysisQueue: [],
  status: "idle",
  analyzeStatus: "idle",
  uploadStatus: "idle",
  error: null,
  loaded: false,
};

export const fetchDocuments = createAsyncThunk("documents/fetchDocuments", async () => {
  return api.documents.list();
});

export const fetchDocumentById = createAsyncThunk("documents/fetchDocumentById", async (id: string) => {
  return api.documents.getById(id);
});

export const uploadDocument = createAsyncThunk("documents/uploadDocument", async (input: {
  files: File[];
  aiAnalysisConsent?: boolean;
}) => {
  return api.documents.upload(input.files, input.aiAnalysisConsent);
});

export const analyzeDocument = createAsyncThunk("documents/analyzeDocument", async (input: {
  files: File[];
  aiAnalysisConsent?: boolean;
}) => {
  return api.documents.analyze(input.files, input.aiAnalysisConsent);
});

export const saveDocument = createAsyncThunk(
  "documents/saveDocument",
  async (payload: SaveDocumentPayload, { getState, dispatch }) => {
    const response = await api.documents.save(payload);
    void dispatch(refreshUsage());
    const currentUserId = (getState() as RootState).auth.user?.id;
    return {
      document: {
        ...response.document,
        ownerProfileId: response.document.ownerProfileId ?? currentUserId ?? null,
      },
    };
  },
);

export const deleteDocument = createAsyncThunk("documents/deleteDocument", async (id: string, { dispatch }) => {
  await api.documents.delete(id);
  void dispatch(refreshUsage());
  return id;
});

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    clearPendingAnalysis(state) {
      state.pendingAnalysis = null;
      state.pendingAnalysisQueue = [];
      state.analyzeStatus = "idle";
      state.uploadStatus = "idle";
      state.error = null;
    },
    setImportedAnalyses(state, action: { payload: AnalyzeDocumentResponse[] }) {
      state.pendingAnalysis = action.payload[0] ?? null;
      state.pendingAnalysisQueue = action.payload.slice(1);
      state.error = null;
    },
    documentAdded(state, action: { payload: DocumentRecord }) {
      state.items = state.items.filter((document) => document.id !== action.payload.id);
      state.items.unshift(action.payload);
    },
    documentUpdated(state, action: { payload: DocumentRecord }) {
      const index = state.items.findIndex((document) => document.id === action.payload.id);
      if (index >= 0) state.items[index] = action.payload;
    },
    documentRemoved(state, action: { payload: string }) {
      state.items = state.items.filter((document) => document.id !== action.payload);
      if (state.selected?.id === action.payload) state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.loaded = true;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to fetch documents.";
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(uploadDocument.pending, (state) => {
        state.uploadStatus = "loading";
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";
        if (action.payload.document) {
          state.items.unshift(action.payload.document);
        } else {
          state.pendingAnalysis = action.payload as AnalyzeDocumentResponse;
        }
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.error = action.error.message ?? "Unable to upload document.";
      })
      .addCase(analyzeDocument.pending, (state) => {
        state.analyzeStatus = "loading";
        state.error = null;
      })
      .addCase(analyzeDocument.fulfilled, (state, action) => {
        state.analyzeStatus = "succeeded";
        state.pendingAnalysis = action.payload;
      })
      .addCase(analyzeDocument.rejected, (state, action) => {
        state.analyzeStatus = "failed";
        state.error = action.error.message ?? "Unable to analyze document.";
      })
      .addCase(saveDocument.pending, (state) => {
        state.uploadStatus = "loading";
        state.error = null;
      })
      .addCase(saveDocument.fulfilled, (state, action) => {
        state.uploadStatus = "succeeded";
        state.pendingAnalysis = state.pendingAnalysisQueue.shift() ?? null;
        state.items = state.items.filter((document) => document.id !== action.payload.document.id);
        state.items.unshift(action.payload.document);
      })
      .addCase(saveDocument.rejected, (state, action) => {
        state.uploadStatus = "failed";
        state.error = action.error.message ?? "Unable to save document.";
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.items = state.items.filter((document) => document.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.items = action.payload.documents;
        state.loaded = true;
        state.status = "succeeded";
      });
  },
});

export const {
  clearPendingAnalysis,
  documentAdded,
  documentRemoved,
  documentUpdated,
  setImportedAnalyses,
} = documentsSlice.actions;
export default documentsSlice.reducer;
