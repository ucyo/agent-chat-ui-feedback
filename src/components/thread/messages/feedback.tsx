import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { TooltipIconButton } from "../tooltip-icon-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

export function MessageFeedback({
  message,
  disabled,
}: {
  message: any;
  disabled: boolean;
}) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract trace ID from message metadata (sent by backend)
  const traceId = message?.additional_kwargs?.langfuse_trace_id;

  const submitFeedback = async (value: "good" | "bad", feedbackComment?: string) => {
    if (!traceId) {
      toast.error("Cannot submit feedback: trace ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          traceId: traceId,
          value: value,
          comment: feedbackComment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast.success(
        value === "good"
          ? "Thank you for your positive feedback!"
          : "Thank you for your feedback!"
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
      // Reset feedback state on error
      setFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbsUp = () => {
    if (feedback === "up") return; // Already submitted
    setFeedback("up");
    submitFeedback("good");
  };

  const handleThumbsDown = () => {
    if (feedback === "down") return; // Already submitted
    setShowCommentDialog(true);
  };

  const handleSubmitComment = () => {
    setFeedback("down");
    setShowCommentDialog(false);
    submitFeedback("bad", comment);
    setComment("");
  };

  const handleCancelComment = () => {
    setShowCommentDialog(false);
    setComment("");
  };

  return (
    <>
      <TooltipIconButton
        onClick={handleThumbsUp}
        variant="ghost"
        tooltip="Good response"
        disabled={disabled || isSubmitting || feedback !== null}
      >
        <AnimatePresence mode="wait" initial={false}>
          {feedback === "up" ? (
            <motion.div
              key="thumbs-up-filled"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <ThumbsUp className="fill-green-500 text-green-500" />
            </motion.div>
          ) : (
            <motion.div
              key="thumbs-up"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <ThumbsUp />
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipIconButton>

      <TooltipIconButton
        onClick={handleThumbsDown}
        variant="ghost"
        tooltip="Bad response"
        disabled={disabled || isSubmitting || feedback !== null}
      >
        <AnimatePresence mode="wait" initial={false}>
          {feedback === "down" ? (
            <motion.div
              key="thumbs-down-filled"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <ThumbsDown className="fill-red-500 text-red-500" />
            </motion.div>
          ) : (
            <motion.div
              key="thumbs-down"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <ThumbsDown />
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipIconButton>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help us improve</DialogTitle>
            <DialogDescription>
              Please tell us what was wrong with this response (optional)
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="The response was not accurate because..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-24"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={handleCancelComment}>
              Cancel
            </Button>
            <Button onClick={handleSubmitComment} disabled={isSubmitting}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
