import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../config/Api";

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/recruiter/jobs", jobData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to create job.",
        }
      );
    }
  }
);

export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ jobId, jobData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/recruiter/jobs/${jobId}`, jobData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to update job.",
        }
      );
    }
  }
);

export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/recruiter/jobs/${jobId}`);

      return {
        jobId,
        ...data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to delete job.",
        }
      );
    }
  }
);

export const getAllJobs = createAsyncThunk(
  "jobs/getAllJobs",
  async (
    {
      page = 0,
      size = 100,
      sort = "createdAt,desc",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/jobs", {
        params: {
          page,
          size,
          sort,
        },
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch jobs.",
        }
      );
    }
  }
);

export const getJobById = createAsyncThunk(
  "jobs/getJobById",
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/${jobId}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch job.",
        }
      );
    }
  }
);

export const viewJob = createAsyncThunk(
  "jobs/viewJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/jobs/${jobId}/view`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to update views.",
        }
      );
    }
  }
);

export const getMyJobs = createAsyncThunk(
  "jobs/getMyJobs",
  async (
    {
      page = 0,
      size = 100,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/recruiter/jobs", {
        params: {
          page,
          size,
        },
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch recruiter jobs.",
        }
      );
    }
  }
);



export const searchJobs = createAsyncThunk(
  "jobs/searchJobs",
  async (searchParams = {}, { rejectWithValue }) => {
    try {
      // Build params — only include keys that have a real value.
      // This covers every parameter the backend's GET /api/jobs/search supports.
      // skills — backend expects List<String>; accept both an array and a
      // comma-separated string coming from the URL / filter state.
      const skillsRaw = searchParams.skills;
      let skillsValue;
      if (Array.isArray(skillsRaw) && skillsRaw.length > 0) {
        skillsValue = skillsRaw;          // already an array — pass as-is
      } else if (typeof skillsRaw === "string" && skillsRaw.trim()) {
        skillsValue = skillsRaw           // comma-separated string → array
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (skillsValue.length === 0) skillsValue = undefined;
      } else {
        skillsValue = undefined;
      }

      const raw = {
        page:            searchParams.page            ?? 0,
        size:            searchParams.size            ?? 100,
        // ⚠ Entity field is createdAt — NOT postedAt
        sort:            searchParams.sort            || "createdAt,desc",
        keyword:         searchParams.keyword?.trim() || undefined,
        city:            searchParams.city?.trim()    || undefined,
        state:           searchParams.state?.trim()   || undefined,
        country:         searchParams.country?.trim() || undefined,
        category:        searchParams.category?.trim()        || undefined,
        jobType:         searchParams.jobType?.trim()         || undefined,
        workingMode:     searchParams.workingMode?.trim()     || undefined,
        experienceLevel: searchParams.experienceLevel?.trim() || undefined,
        qualification:   searchParams.qualification?.trim()   || undefined,
        skills:          skillsValue,
        minimumSalary:   searchParams.minimumSalary != null ? searchParams.minimumSalary : undefined,
        maximumSalary:   searchParams.maximumSalary != null ? searchParams.maximumSalary : undefined,
        featured:        searchParams.featured    != null   ? searchParams.featured      : undefined,
        urgentHiring:    searchParams.urgentHiring != null  ? searchParams.urgentHiring  : undefined,
        easyApply:       searchParams.easyApply   != null   ? searchParams.easyApply     : undefined,
        postedWithinDays: searchParams.postedWithinDays != null ? searchParams.postedWithinDays : undefined,
        sortBy:          searchParams.sortBy?.trim()          || undefined,
      };

      // Strip undefined so Axios doesn't serialize empty params
      const params = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v != null)
      );

      const { data } = await api.get("/jobs/search", { params });
      return data;

    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Search failed",
        }
      );
    }
  }
);


export const filterJobs = createAsyncThunk(
  "jobs/filterJobs",
  async (
    {
      filters = {}
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post(
        "/jobs/filter",
        filters,
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to filter jobs.",
        }
      );
    }
  }
);


export const getCompanyJobs = createAsyncThunk(
  "jobs/getCompanyJobs",
  async (
    {
      companyId,
      page = 0,
      size = 10,
      sort = "createdAt,desc",
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/jobs/company/${companyId}`,
        {
          params: {
            page,
            size,
            sort,
          },
        }
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch company jobs.",
        }
      );
    }
  }
);


export const getJobsByCategory = createAsyncThunk(
  "jobs/getJobsByCategory",
  async ({ category }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/category/${category}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch category jobs.",
        }
      );
    }
  }
);


export const getLatestJobs = createAsyncThunk(
  "jobs/getLatestJobs",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/jobs/latest");

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch latest jobs.",
        }
      );
    }
  }
);


export const getFeaturedJobs = createAsyncThunk(
  "jobs/getFeaturedJobs",
  async (
    {
      page = 0,
      size = 10,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get(
        "/jobs/featured",
        {
          params: {
            page,
            size,
          },
        }
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch featured jobs.",
        }
      );
    }
  }
);



export const getSimilarJobs = createAsyncThunk(
  "jobs/getSimilarJobs",
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/${jobId}/similar`);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch similar jobs.",
        }
      );
    }
  }
);


export const getCategories = createAsyncThunk(
  "jobs/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/jobs/categories");

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch categories.",
        }
      );
    }
  }
);


export const getWorkModes = createAsyncThunk(
  "jobs/getWorkModes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/jobs/work-modes");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch work modes.",
        }
      );
    }
  }
);

export const fetchSearchSuggestions = createAsyncThunk(
  "jobs/fetchSearchSuggestions",
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/jobs/suggestions", {
        params: { query },
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch search suggestions.",
        }
      );
    }
  }
);

export const fetchSearchFacets = createAsyncThunk(
  "jobs/fetchSearchFacets",
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/jobs/facets", {
        params: filterParams,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? {
          success: false,
          message: "Unable to fetch search facets.",
        }
      );
    }
  }
);

const initialState = {

    // ---------------- Job Lists ----------------

    jobs: [],
    latestJobs: [],
    featuredJobs: [],
    myJobs: [],
    companyJobs: [],
    categoryJobs: [],
    similarJobs: [],

    // ---------------- Search & Facets ----------------

    suggestions: {
        jobTitles: [],
        skills: [],
        companies: [],
        locations: [],
    },
    facets: null,

    // ---------------- Job Details ----------------

    selectedJob: null,

    // ---------------- Dashboard ----------------

    categories: [],
    workModes: [],


    // ---------------- Pagination ----------------

    pagination: {
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
    },

    // ---------------- Request Status ----------------

    loading: false,
    success: false,
    error: null,
    message: ""
};

// ---------------- Helpers ----------------

const extractPagination = (data) => ({
  pageNumber: data?.pageNumber ?? data?.number ?? 0,
  pageSize: data?.pageSize ?? data?.size ?? 10,
  totalElements: data?.totalElements ?? 0,
  totalPages: data?.totalPages ?? 0,
  first: data?.first ?? true,
  last: data?.last ?? true,
});

const setPending = (state) => {
  state.loading = true;
  state.error = null;
  state.success = false;
};

const setRejected = (state, action) => {
  state.loading = false;
  state.success = false;
  state.error = action.payload?.message || "Something went wrong.";
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearJobError: (state) => {
      state.error = null;
    },
    clearJobMessage: (state) => {
      state.message = "";
    },
    resetJobState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
    },
    clearSelectedJob: (state) => {
      state.selectedJob = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ---------------- Create Job ----------------
      .addCase(createJob.pending, setPending)
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Job created successfully.";
        const newJob = action.payload?.data ?? action.payload;
        if (newJob) {
          state.jobs.unshift(newJob);
          state.myJobs.unshift(newJob);
        }
      })
      .addCase(createJob.rejected, setRejected)

      // ---------------- Update Job ----------------
      .addCase(updateJob.pending, setPending)
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Job updated successfully.";
        const updated = action.payload?.data;
        if (updated) {
          state.jobs = state.jobs.map((job) =>
            job.id === updated.id ? updated : job
          );
          state.myJobs = state.myJobs.map((job) =>
            job.id === updated.id ? updated : job
          );
          if (state.selectedJob?.id === updated.id) {
            state.selectedJob = updated;
          }
        }
      })
      .addCase(updateJob.rejected, setRejected)

      // ---------------- Delete Job ----------------
      .addCase(deleteJob.pending, setPending)
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload?.message || "Job deleted successfully.";
        const { jobId } = action.payload;
        state.jobs = state.jobs.filter((job) => job.id !== jobId);
        state.myJobs = state.myJobs.filter((job) => job.id !== jobId);
        if (state.selectedJob?.id === jobId) {
          state.selectedJob = null;
        }
      })
      .addCase(deleteJob.rejected, setRejected)

      // ---------------- Get All Jobs ----------------
      .addCase(getAllJobs.pending, setPending)
      .addCase(getAllJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const raw = action.payload?.data ?? action.payload ?? {};
        const content = raw.content ?? (Array.isArray(raw) ? raw : []);
        state.jobs = content;
        state.pagination = extractPagination(raw);
      })
      .addCase(getAllJobs.rejected, setRejected)

      // ---------------- Get Job By Id ----------------
      .addCase(getJobById.pending, setPending)
      .addCase(getJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.selectedJob = action.payload?.data ?? null;
      })
      .addCase(getJobById.rejected, setRejected)

      // ---------------- View Job ----------------
      .addCase(viewJob.fulfilled, (state, action) => {
        if (state.selectedJob && action.payload?.data) {
          state.selectedJob.views = action.payload.data.views ?? state.selectedJob.views;
        }
      })
      .addCase(viewJob.rejected, (state, action) => {
        state.error = action.payload?.message || "Unable to update views.";
      })

      // ---------------- Get My Jobs (Recruiter) ----------------
      .addCase(getMyJobs.pending, setPending)
      .addCase(getMyJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const raw = action.payload?.data ?? action.payload ?? {};
        const content = raw.content ?? (Array.isArray(raw) ? raw : []);
        state.myJobs = content;
        state.pagination = extractPagination(raw);
      })
      .addCase(getMyJobs.rejected, setRejected)

      // ---------------- Search Jobs ----------------
      .addCase(searchJobs.pending, setPending)
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const page = action.payload?.data ?? {};
        state.jobs = page.content ?? [];
        state.pagination = extractPagination(page);
      })
      .addCase(searchJobs.rejected, setRejected)

      // ---------------- Filter Jobs ----------------
      .addCase(filterJobs.pending, setPending)
      .addCase(filterJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const page = action.payload?.data ?? {};
        state.jobs = page.content ?? [];
        state.pagination = extractPagination(page);
      })
      .addCase(filterJobs.rejected, setRejected)

      // ---------------- Get Company Jobs ----------------
      .addCase(getCompanyJobs.pending, setPending)
      .addCase(getCompanyJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const page = action.payload?.data ?? {};
        state.companyJobs = page.content ?? [];
        state.pagination = extractPagination(page);
      })
      .addCase(getCompanyJobs.rejected, setRejected)

      // ---------------- Get Jobs By Category ----------------
      .addCase(getJobsByCategory.pending, setPending)
      .addCase(getJobsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const page = action.payload?.data ?? {};
        state.categoryJobs = page.content ?? (Array.isArray(action.payload?.data) ? action.payload.data : []);
        state.pagination = extractPagination(page);
      })
      .addCase(getJobsByCategory.rejected, setRejected)

      // ---------------- Get Latest Jobs ----------------
      .addCase(getLatestJobs.pending, setPending)
      .addCase(getLatestJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const raw = action.payload?.data ?? action.payload ?? [];
        state.latestJobs = Array.isArray(raw) ? raw : (raw.content ?? []);
      })
      .addCase(getLatestJobs.rejected, setRejected)

      // ---------------- Get Featured Jobs ----------------
      .addCase(getFeaturedJobs.pending, setPending)
      .addCase(getFeaturedJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const raw = action.payload?.data ?? action.payload ?? {};
        const content = raw.content ?? (Array.isArray(raw) ? raw : []);
        state.featuredJobs = content;
        state.pagination = extractPagination(raw);
      })
      .addCase(getFeaturedJobs.rejected, setRejected)

      // ---------------- Get Similar Jobs ----------------
      .addCase(getSimilarJobs.pending, setPending)
      .addCase(getSimilarJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.similarJobs = action.payload?.data ?? [];
      })
      .addCase(getSimilarJobs.rejected, setRejected)

      // ---------------- Get Categories ----------------
      .addCase(getCategories.pending, setPending)
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.categories = action.payload?.data ?? [];
      })
      .addCase(getCategories.rejected, setRejected)

      // ---------------- Get Work Modes ----------------
      .addCase(getWorkModes.pending, setPending)
      .addCase(getWorkModes.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.workModes = action.payload?.data ?? [];
      })
      .addCase(getWorkModes.rejected, setRejected)

      // ---------------- Search Suggestions ----------------
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload?.data ?? {
          jobTitles: [],
          skills: [],
          companies: [],
          locations: [],
        };
      })

      // ---------------- Search Facets ----------------
      .addCase(fetchSearchFacets.fulfilled, (state, action) => {
        state.facets = action.payload?.data ?? null;
      });
  },
});

export const {
  clearJobError,
  clearJobMessage,
  resetJobState,
  clearSelectedJob,
} = jobSlice.actions;

export default jobSlice.reducer;